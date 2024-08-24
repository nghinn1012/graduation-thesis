import { NOTIFICATION_SERVICE } from "../config/users.config";
import { publishMessage } from "./broker";

export { getChannel } from "./channel";
export { withQueue, subscribeMessage, publishMessage, operations } from "./broker";
export { RPCObserver, RPCRequest } from "./rpc_setup";

export const brokerChannel = {
  toMessageServiceQueue: (message: string) => publishMessage(NOTIFICATION_SERVICE, message)
}
