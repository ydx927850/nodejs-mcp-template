import { HTTPController, HTTPMethod, HTTPMethodEnum, HTTPQuery } from "chair/tegg";

@HTTPController({ path: "/hello" })
class HttpHelloController {
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: "/" })
  async sayHello(@HTTPQuery() name: string): Promise<string> {
    return `Hello ${name}`;
  }
}

export default HttpHelloController;
