import { Channel, ConsumeMessage } from "amqplib";
import { EXCHANGE_NAME, NOTIFICATION_SERVICE } from "../config/notification.config";
import { getChannel } from "./channel";
import { MannualAccountInfo, sendActiveMannualAccount } from "../services/mailService";

export const operations = {
  mail: {
    ACTIVE_MANNUAL_ACCOUNT: "ACTIVE_MANNUAL_ACCOUNT"
  }
} as const;

// Message Broker
export const withQueue = async () => {
  try {
    const channel = await getChannel();
    await channel.assertQueue(EXCHANGE_NAME, {
      durable: true,
    });
    return channel;
  } catch (err) {
    throw err;
  }
};

export const publishMessage = async (targetService: string, msg: string) => {
  const channel = await getChannel();
  channel.publish(EXCHANGE_NAME, targetService, Buffer.from(msg));
};

export const subscribeMessage = async () => {
  const channel = await getChannel();
  await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
  console.log(`Broker [EXCHANGE] Create exchange with name ${EXCHANGE_NAME}`)
  const q = await channel.assertQueue("", { exclusive: true });
  console.log(`Broker [QUEUE] Create queue with name ${q.queue}`);
  console.log(`Broker [QUEUE] Waiting for messages in queue ${q.queue}`)

  channel.bindQueue(q.queue, EXCHANGE_NAME, NOTIFICATION_SERVICE);
  console.log(`Broker [BINDING] Biding exchange ${EXCHANGE_NAME} and queue ${q.queue} with name ${NOTIFICATION_SERVICE}`);

  channel.consume(
    q.queue,
    (msg: ConsumeMessage | null) => {
      if (msg != null) {
        const message = msg.content.toString();
        let parsed: { [key: string]: any; } | null = null;
        try {
          parsed = JSON.parse(message);
          if (parsed === null) {
            return;
          }

          console.log("Broker ", "recieved message from ", parsed.from, parsed);

          exeOperation(parsed).then((result: boolean) => {
            if (result === false) {
              console.log("Cannot to execute operation with data ", parsed);
            }
          });

        } catch (error) {
          console.log("Error when parsed message", error);
        }
      }
    },
    {
      noAck: true,
    }
  );
};

export const exeOperation = async (info: { [key: string]: any }): Promise<boolean> => {

  try {
    switch (info.operation) {
      case operations.mail.ACTIVE_MANNUAL_ACCOUNT: {
        const accountInfo = info as MannualAccountInfo;
        const messageInfo = await sendActiveMannualAccount(accountInfo);
        if (messageInfo === null) {
          return false;
        }
        break;
      }
    }
  } catch (error) {
    console.log("Error while execute operation", error);
    return false;
  }

  return true;
}
