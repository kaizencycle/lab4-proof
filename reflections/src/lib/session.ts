import { ironSession } from "iron-session/edge";
import { IronSessionOptions } from "iron-session";

export type UserSession = { handle?: string };

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "agora_session",
  cookieOptions: {
    secure: true,
    sameSite: "lax",
    httpOnly: true,
  },
};

export function getSession(req: Request, res?: Response) {
  // edge-compatible session
  return ironSession<UserSession>(req, res as any, sessionOptions);
}
