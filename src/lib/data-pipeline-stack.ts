import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as snsSubscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as events from "aws-cdk-lib/aws-events";
import * as eventsTargets from "aws-cdk-lib/aws-events-targets";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

const PRODUCER_COUNT = 1;
const AXIOM_DATASET = "messages-pipeline-events";

export class DataPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const topic = new sns.Topic(this, "MessagesTopic");

    const axiomLayerArn = `arn:aws:lambda:${this.region}:694952825951:layer:axiom-extension-arm64:11`;
    const axiomLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "AxiomLayer",
      axiomLayerArn,
    );

    const axiomApiKeyParamName = "/axiom/api/key";

    for (let i = 0; i < PRODUCER_COUNT; i++) {
      const producerFunction = new NodejsFunction(
        this,
        `ProducerFunction${i}`,
        {
          runtime: lambda.Runtime.NODEJS_18_X,
          entry: path.join(__dirname, "../lambda/producer.ts"),
          handler: "handler",
          timeout: cdk.Duration.seconds(10),
          architecture: lambda.Architecture.ARM_64,
          environment: {
            TOPIC_ARN: topic.topicArn,
          },
          functionName: `message-producer-${i}`,
        },
      );

      topic.grantPublish(producerFunction);

      const rule = new events.Rule(this, `ProducerScheduleRule${i}`, {
        schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
      });

      rule.addTarget(new eventsTargets.LambdaFunction(producerFunction));

      producerFunction.addLayers(axiomLayer);

      const axiomApiKey = ssm.StringParameter.fromStringParameterName(
        this,
        `AxiomApiKeyProducer${i}`,
        axiomApiKeyParamName,
      );

      axiomApiKey.grantRead(producerFunction);

      producerFunction.addEnvironment("AXIOM_TOKEN", axiomApiKey.stringValue);
      producerFunction.addEnvironment("AXIOM_DATASET", AXIOM_DATASET);
    }

    const queue = new sqs.Queue(this, "ClientQueue", {
      visibilityTimeout: cdk.Duration.seconds(30),
    });

    topic.addSubscription(new snsSubscriptions.SqsSubscription(queue));

    const clientFunction = new NodejsFunction(this, "ClientFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, "../lambda/client.ts"),
      handler: "handler",
      timeout: cdk.Duration.seconds(10),
      architecture: lambda.Architecture.ARM_64,
      functionName: "message-client",
    });

    queue.grantConsumeMessages(clientFunction);

    clientFunction.addEventSource(new lambdaEventSources.SqsEventSource(queue));

    clientFunction.addLayers(axiomLayer);

    const axiomApiKeyClient = ssm.StringParameter.fromStringParameterName(
      this,
      "AxiomApiKeyClient",
      axiomApiKeyParamName,
    );

    axiomApiKeyClient.grantRead(clientFunction);

    clientFunction.addEnvironment("AXIOM_TOKEN", axiomApiKeyClient.stringValue);
    clientFunction.addEnvironment("AXIOM_DATASET", AXIOM_DATASET);
  }
}
