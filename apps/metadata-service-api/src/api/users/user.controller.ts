import { Get, Path, Route, Queries, Tags } from "tsoa";
import { EthAddress } from "../../schemas/common";
import { GetUserTokensArgs } from "./user.schema";
import UserService from "./user.service";
import { BaseController } from "../baseController";
import { SupportedChain } from "src/env";

@Route(":chain/users")
@Tags("user")
export class UserController extends BaseController {
  /**
   *
   * @example userId "0x54BE3a794282C030b15E43aE2bB182E14c409C5e"
   * @returns
   */
  @Get("{userId}/tokens")
  public async getUserTokens(
    @Path("chain") chain: SupportedChain,
    @Path() userId: string,
    @Queries() params: GetUserTokensArgs
  ) {
    this.validateChain(chain);
    const account = EthAddress.parse(userId);
    const args = GetUserTokensArgs.parse(params);

    const response = await UserService.getUserTokens(chain, account, args.collection, args.continuation);

    return response;
  }
}
