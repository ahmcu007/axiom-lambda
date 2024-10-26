import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { randomBytes } from "crypto";

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

export const handler = async (event: any) => {
  // Generate a random number of logs between 1 and 10
  const numberOfLogs = Math.floor(Math.random() * 10) + 1;

  // Simulate execution outcome with a 90% chance of success
  const isSuccess = Math.random() < 0.9;

  if (!isSuccess) {
    console.error("Exception will be thrown");
    throw new Error("Failed execution");
  }

  for (let i = 0; i < numberOfLogs; i++) {
    // Create a unique message ID
    const messageId = `msg-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // Get the current datetime in ISO format
    const datetime = new Date().toISOString();

    // Generate random base64 data of at least 50 bytes
    const dataBuffer = randomBytes(50); // Generates 50 bytes
    const data = dataBuffer.toString("base64");

    // Construct the message object
    const message = {
      datetime,
      messageId,
      data,
    };

    console.info(`Publishing message ${messageId}`);

    // Publish the message to the SNS topic
    const params = {
      TopicArn: process.env.TOPIC_ARN, // Ensure this environment variable is set
      Message: JSON.stringify(message),
    };

    try {
      const command = new PublishCommand(params);
      await snsClient.send(command);
      console.info(`Message ${messageId} published successfully`);
    } catch (error) {
      console.error(`Failed to publish message ${messageId}`, error);
    }
  }
};
