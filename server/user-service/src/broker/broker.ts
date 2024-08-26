import { ConsumeMessage } from "amqplib";
import { EXCHANGE_NAME, USER_SERVICE } from "../config/users.config";
import { getChannel } from "./channel";

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
  console.log(` [EXCHANGE] Create exchange with name ${EXCHANGE_NAME}`)
  const q = await channel.assertQueue("", { exclusive: true });
  console.log(` [QUEUE] Create queue with name ${q.queue}`);
  console.log(` [QUEUE] Waiting for messages in queue ${q.queue}`)

  channel.bindQueue(q.queue, EXCHANGE_NAME, USER_SERVICE);
  console.log(` [BINDING] Biding exchange ${EXCHANGE_NAME} and queue ${q.queue} with name ${USER_SERVICE}`);

  channel.consume(
    q.queue,
    (msg: ConsumeMessage | null) => {
      if (msg != null) {
        console.log("the message is:", msg.content.toString());
      }
      console.log("[X] received");
    },
    {
      noAck: true,
    }
  );
};
