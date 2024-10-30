# Axiom Demo Data Pipeline

This project demonstrates a serverless data pipeline using AWS Lambda, AWS CDK, and Axiom, showcasing automated logging, monitoring, and data processing in a fully serverless environment.

## Project Overview

This pipeline includes:

- **Producer Lambda**: Periodically generates messages with simulated data and sends them to an SNS topic.
- **SNS Topic**: Routes messages from the producer to the SQS queue.
- **SQS Queue**: Acts as the storage for messages to be consumed.
- **Consumer Lambda**: Processes messages from the queue and logs results to Axiom.
- **Axiom Integration**: Provides real-time monitoring, logging, and dashboarding.

## Components

1. **Producer Function**: Runs every minute, generating data messages and sometimes simulating errors.
2. **SNS Topic**: Receives and forwards messages from the producer.
3. **SQS Queue**: Holds messages until consumed.
4. **Consumer Function**: Processes messages, logging outcomes in Axiom.
5. **Axiom**: Stores logs, enabling analysis and dashboarding.

## Setup

### Prerequisites

- **Node.js** and **AWS CLI**
- AWS and Axiom accounts with respective credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/axiom-demo.git
   cd axiom-demo
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure AWS credentials:
   ```bash
   aws configure
   ```
4. Store Axiom API key in AWS SSM:
   ```bash
   aws ssm put-parameter --name "/axiom/api/key" --value "YOUR_AXIOM_API_KEY" --type "SecureString"
   ```

### Deployment

Deploy the application stack using CDK:
```bash
npx cdk deploy
```

## How It Works

1. **Producer** sends periodic messages to SNS.
2. **SNS** forwards to **SQS**.
3. **Consumer** retrieves messages from SQS, processing and logging in Axiom.
4. **Axiom** visualizes data for real-time insights.

## Useful Commands

- **Build**: `npm run build`
- **Watch**: `npm run watch`
- **Test**: `npm run test`
- **Deploy**: `npx cdk deploy`
- **Destroy**: `npx cdk destroy`

## Acknowledgments

Thanks to Axiom for their logging platform and all contributors.

Happy coding!
