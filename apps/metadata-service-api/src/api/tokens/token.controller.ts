import { Get, Path, Post, Tags, Route, SuccessResponse, Queries } from "tsoa";
import { QueryTokensArgs } from "./token.schema";
import TokenService from "./token.service";
import { BaseController } from "../baseController";
import { SupportedChain } from "src/env";

@Route(":chain/tokens")
@Tags("token")
export class TokenController extends BaseController {
  /**
   *
   * @returns
   */
  @Get("query")
  public async queryTokens(@Path("chain") chain: SupportedChain, @Queries() params: QueryTokensArgs) {
    this.validateChain(chain);
    const args = QueryTokensArgs.parse(params);

    return await TokenService.queryTokensWithMoralis(chain, {
      ...args,
      from_date: args.from_date?.toISOString(),
      to_date: args.to_date?.toISOString(),
    });
  }
}
