import * as AuthorizationModule from "./requested/authorization";
import * as PlayerModule from "./requested/player";
import * as ClubModule from "./requested/club";
import * as ClubPlayerModule from "./requested/clubPlayer";
import * as ClubPlayerApplicationModule from "./requested/clubPlayerApplication";
import * as GamesModule from "./requested/games";

import * as ReturnedCommonModule from "./returned/common";
import * as ReturnedPlayerModule from "./returned/player";
import * as ReturnedClubModule from "./returned/club";
import * as ReturnedClubPlayerModule from "./returned/clubPlayer";
import * as ReturnedClubPlayerApplicationModule from "./returned/clubPlayerApplication";
import * as ReturnedGamesModule from "./returned/games";

/**
 * 网关
 */
export namespace Gateway {
  /**
   * 请求
   */
  export namespace Requested {
    /**
     * 鉴权
     */
    export import Authorization = AuthorizationModule;

    /**
     * 玩家
     */
    export import Player = PlayerModule;

    /**
     * 俱乐部
     */
    export import Club = ClubModule;

    /**
     * 俱乐部玩家
     */
    export import ClubPlayer = ClubPlayerModule;

    /**
     * 俱乐部玩家申请
     */
    export import ClubPlayerApplication = ClubPlayerApplicationModule;

    /**
     * 游戏相关
     */
    export import Games = GamesModule;
  }

  /**
   * 返回
   */
  export namespace Returned {
    /**
     * 通用
     */
    export import Common = ReturnedCommonModule;

    /**
     * 玩家
     */
    export import Player = ReturnedPlayerModule;

    /**
     * 俱乐部
     */
    export import Club = ReturnedClubModule;

    /**
     * 俱乐部玩家
     */
    export import ClubPlayer = ReturnedClubPlayerModule;

    /**
     * 俱乐部玩家申请
     */
    export import ClubPlayerApplication = ReturnedClubPlayerApplicationModule;

    /**
     * 游戏相关
     */
    export import Games = ReturnedGamesModule;
  }
}
