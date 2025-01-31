import {ModelContainer} from '@nxtranet/headers';
import {Client} from '@nxtranet/service';
import type {
  EventClustersDeploy,
  EventContainersAttach,
  EventContainersInfo,
  EventContainersRemove,
  EventContainersStart,
  EventContainersStop
} from '../headers/docker.h';
import {
  host,
  port
} from '../shared/config';
import Events from '../shared/events';

let client: Client | null = null;

export function connect() {
  client = new Client(`http://${host}:${port}`);
  return client;
}

export function disconnect() {
  client.socket.disconnect();
}

export function clustersDeploy(
  payload: EventClustersDeploy.payload
): Promise<EventClustersDeploy.response> {
  return client.send<
    EventClustersDeploy.payload,
    EventClustersDeploy.response
  >(Events.clustersDeploy, payload);
}

export function containersAttach(
  payload: EventContainersAttach.payload,
): Promise<EventContainersAttach.response> {
  return client.send<
    EventContainersAttach.payload,
    EventContainersAttach.response
  >(Events.containersAttach, payload);
}

export function containersInfo(
  payload: EventContainersInfo.payload,
): Promise<EventContainersInfo.response> {
  return client.send<
    EventContainersInfo.payload,
    EventContainersInfo.response
  >(Events.containersInfo, payload);
}

export function containersStart(
  payload: EventContainersStart.payload
): Promise<EventContainersStart.response> {
  return client.send<
    EventContainersStart.payload,
    EventContainersStart.response
  >(Events.containersStart, payload);
}

export function containersStop(
  payload: EventContainersStop.payload,
): Promise<EventContainersStop.response> {
  return client.send<
    EventContainersStop.payload,
    EventContainersStop.response
  >(Events.containersStop, payload);
}

export function containersRemove(
  payload: EventContainersRemove.payload,
): Promise<EventContainersRemove.response> {
  return client.send<
    EventContainersRemove.payload,
    EventContainersRemove.response
  >(Events.containersRemove, payload);
}

export function watchContainersStatus(
  payload: ModelContainer,
  callback: (event: {type: string, payload: any}) => void,
): void {
  client.socket.on(payload.namespace, callback);
}
