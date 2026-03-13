// Don't modified this file, it's auto created by @alipay/oneapi-codegen-sdk

/* tslint:disable */
/* eslint-disable */
/* c8 ignore start */
/* istanbul ignore file */
// @ts-nocheck

import {
  SingletonProto,
  LayottoFacade, LayottoFacadeInvokeOptions,
} from "chair/tegg";

/**
 * @class `com.alipay.chair.Mosn.EchoRequest`
 * @param message: `java.lang.String`
 */
export type EchoRequest = {
  message?: string;
};

class EchoRequest_Class {
  message?: string;

  constructor(data: EchoRequest) {
    if (data.message) {
      this.message = data.message;
    }
  }

  toJSON() {
    return {
      $: {
        message: this.message,
      },
      $class: "com.alipay.chair.Mosn.EchoRequest",
    };
  }
}

/**
 * @class `com.alipay.chair.Mosn.EchoResponse`
 * @Dependent by `com.alipay.chair.Mosn.CommonResult<com.alipay.chair.Mosn.EchoResponse>` on property `result`
 * @param uid: `java.lang.String`
 * @param message: `java.lang.String`
 */
export type EchoResponse = {
  uid?: string;
  message?: string;
};

class EchoResponse_Class {
  uid?: string;
  message?: string;

  constructor(data: EchoResponse) {
    if (data.uid) {
      this.uid = data.uid;
    }
    if (data.message) {
      this.message = data.message;
    }
  }

  toJSON() {
    return {
      $: {
        uid: this.uid,
        message: this.message,
      },
      $class: "com.alipay.chair.Mosn.EchoResponse",
    };
  }
}

/**
 * @class `com.alipay.chair.Mosn.CommonResult<com.alipay.chair.Mosn.EchoResponse>`
 * @param success: `java.lang.Boolean`
 * @param message: `java.lang.String`
 * @param result: `com.alipay.chair.Mosn.EchoResponse`
 */
export type CommonResult$$EchoResponse = {
  success?: boolean;
  message?: string;
  result?: EchoResponse;
};

class CommonResult$$EchoResponse_Class {
  success?: boolean;
  message?: string;
  result?: EchoResponse_Class;

  constructor(data: CommonResult$$EchoResponse) {
    if (data.success) {
      this.success = data.success;
    }
    if (data.message) {
      this.message = data.message;
    }
    if (data.result) {
      this.result = new EchoResponse_Class(data.result);
    }
  }

  toJSON() {
    return {
      $: {
        success: this.success,
        message: this.message,
        result: this.result,
      },
      $class: "com.alipay.chair.Mosn.CommonResult",
    };
  }
}

@SingletonProto()
export class EchoFacade extends LayottoFacade {
  protected readonly $APP = "chairmosn";
  protected readonly $ID = "com.alipay.chair.Mosn.EchoFacade:1.0";
  protected readonly $TYPE_ANNOTATIONS = {};

  /**
   * @method: com.alipay.chair.Mosn.EchoFacade:echo()
   * @param uid: `java.lang.String`
   * @param req: `com.alipay.chair.Mosn.EchoRequest`
   * @return `com.alipay.chair.Mosn.CommonResult<com.alipay.chair.Mosn.EchoResponse>`
   */
  async echo(
    uid: string,
    req: EchoRequest,
    layottoOptions?: LayottoFacadeInvokeOptions): Promise<CommonResult$$EchoResponse> {
    const method = "echo";
    const signatures = ["java.lang.String", "com.alipay.chair.Mosn.EchoRequest"];
    const parameterArgs = [uid, req];
    const parameterNames = ["uid","req"];
    const parameterAnnotations = [
  {},
  {}
];
    const methodAnnotations = {};
    return await this.$invoke(
      method,
      signatures,
      {
        ...layottoOptions,
        parameterArgs,
        parameterNames,
        parameterAnnotations,
        methodAnnotations,
      },
      uid,
      new EchoRequest_Class(req)
    );
  }
}

/* c8 ignore stop */
