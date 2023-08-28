import { ChainName } from "src/schemas/common";
import { Controller } from "tsoa";

export class BaseController extends Controller {
  validateChain(chain: string) {
    ChainName.parse(chain);
  }
}
