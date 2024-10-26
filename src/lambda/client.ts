import { Context, SNSMessage } from "aws-lambda";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { randomBytes } from "crypto";

const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

export const handler = async (event: any, context: Context) => {
  console.info("Processor Lambda invoked with event:", JSON.stringify(event));

  for (const record of event.Records) {
    // Parse the SQS body
    const sqsBody = JSON.parse(record.body);
    // Parse the SNS message
    const snsMessage = JSON.parse(sqsBody.Message);

    console.info("Received SNS message:", snsMessage);

    // Simulate processing the message
    const isSuccess = Math.random() < 0.95; // 95% chance of success

    if (!isSuccess) {
      console.error(
        "Simulated processing failure for message:",
        snsMessage.messageId,
      );
      throw new Error(`Failed to process message ${snsMessage.messageId}`);
    }

    console.info(`Message ${snsMessage.messageId} processed`);
  }
};
