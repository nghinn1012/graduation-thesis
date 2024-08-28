import amqplib, { Connection, Channel } from "amqplib";
import { AMQP_PATH } from "../config/post.config"
interface RabbitInfo {
  connection?: Connection;
  channel?: Channel;
}
const rabbit: RabbitInfo = {
  connection: undefined,
  channel: undefined
}

export const getChannel = async (): Promise<Channel> => {
  if (rabbit.connection === undefined) {
    rabbit.connection = await amqplib.connect(AMQP_PATH);
    console.log(` Connection established`)
  }
  if (rabbit.channel == undefined) {
    rabbit.channel = await rabbit.connection.createChannel();
    console.log(` Channel created`)
  }
  return rabbit.channel;
};

export const initChannel = async (): Promise<void> => {
  await getChannel();
}
