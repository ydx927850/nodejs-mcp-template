import { HTTPController, HTTPMethod, HTTPMethodEnum, HTTPQuery } from "@alipay/tegg";

@HTTPController({ path: "/hello" })
class HttpHelloController {
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: "/" })
  async sayHello(@HTTPQuery() name: string): Promise<string> {
    return `Hello ${name}`;
  }
}

export default HttpHelloController;
