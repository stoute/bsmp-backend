// import packageJson from '../../package.json';
// import configJson from '../app/app-config.json';
import * as store from "@lib/appStore";
import { type AppState, type ChatState } from "@lib/appStore";
// import { type IPromptTemplate } from "@types";
import * as config from "@consts";

const production: boolean = process.env.NODE_ENV === "production";

export class AppService {
  private static instance: AppService;
  public name = config.SITE.TITLE;
  public store = store;
  public state: AppState = store.appState;
  public initialized: boolean = false;
  public production: boolean = production;
  public config: any = config;
  // public version: string = packageJson.version;
  // public apikeyOpenAi = process.env.NEXT_PUBLIC_OPENAI_API_KEY as string;

  private constructor() {
    // this.init().then(() => {
    console.log("AppService constructor");
    //     console.log(this);
    // });
  }

  // public methods and properties
  async init() {
    console.log("app init");
    console.log(this);
    this.initialized = true;
  }

  debug(value: any = undefined): void {
    console.log("debug");
    if (this.production) return;
    if (value) {
      console.log(value);
      return;
    }
    console.log(this);
  }

  public static getInstance(): AppService {
    if (!AppService.instance) {
      AppService.instance = new AppService();
    }
    return AppService.instance;
  }
}

export const appService = AppService.getInstance();
