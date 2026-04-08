import { onRequestGet as __getMasterCode_ts_onRequestGet } from "C:\\Users\\User\\my_apps\\pocoapoke\\functions\\getMasterCode.ts"
import { onRequestGet as __getPokemonData_ts_onRequestGet } from "C:\\Users\\User\\my_apps\\pocoapoke\\functions\\getPokemonData.ts"

export const routes = [
    {
      routePath: "/getMasterCode",
      mountPath: "/",
      method: "GET",
      middlewares: [],
      modules: [__getMasterCode_ts_onRequestGet],
    },
  {
      routePath: "/getPokemonData",
      mountPath: "/",
      method: "GET",
      middlewares: [],
      modules: [__getPokemonData_ts_onRequestGet],
    },
  ]