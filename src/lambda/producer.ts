import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { randomBytes } from "crypto";

const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const IMEIs = [
  "IMEI12345678901",
  "IMEI12345678902",
  "IMEI12345678903",
  "IMEI12345678904",
  "IMEI12345678905",
  "IMEI12345678906",
  "IMEI12345678907",
  "IMEI12345678908",
  "IMEI12345678909",
  "IMEI12345678910",
];
const messageTypes = ["REG", "ACK", "ERR"];

export const handler = async (event: any) => {
  const numberOfLogs = Math.floor(Math.random() * 10) + 1;
  const isProducerSuccessful = Math.random() < 0.9;

  if (!isProducerSuccessful) {
    console.error("Producer failed execution.");
    throw new Error("Failed execution");
  }

  for (let i = 0; i < numberOfLogs; i++) {
    const messageId = `msg-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const datetime = new Date().toISOString();
    const dataBuffer = randomBytes(50);
    const data = dataBuffer.toString("base64");
    const imei = IMEIs[Math.floor(Math.random() * IMEIs.length)];
    const type = messageTypes[Math.floor(Math.random() * messageTypes.length)];

    const message = {
      datetime,
      messageId,
      imei,
      type, // Message type: REG, ACK, or ERR
      data,
    };

    console.info(
      `Publishing message ${messageId} with IMEI: ${imei} and type: ${type}`,
    );

    const params = {
      TopicArn: process.env.TOPIC_ARN,
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
