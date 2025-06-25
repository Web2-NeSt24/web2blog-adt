import type { LoaderFunctionArgs, MetaDescriptor, MetaFunction } from "react-router";

export namespace Route {
  export type LoaderArgs = LoaderFunctionArgs;
  export type MetaArgs = Parameters<MetaFunction>[0];
}
