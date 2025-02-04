import "@shopify/shopify-api/adapters/node";
import { NextApiRequest, NextApiResponse } from "next";

const clientId = process.env.SHOPIFY_CLIENT_ID!;
const redirectUri = "https://swan-great-pup.ngrok-free.app/api/auth/callback";

const tokenEndpoint =
  "https://shopify.com/authentication/1360134207/oauth/token";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Authorization code missing" });
  }

  try {
    // console.log("code", code);

    const body = new URLSearchParams();
    body.append("client_id", clientId);
    body.append("grant_type", "authorization_code");
    body.append("code", code as string);
    body.append("redirect_uri", redirectUri);

    const headers = {
      "content-type": "application/x-www-form-urlencoded",
      // Confidential Client
      // 'Authorization': 'Basic `<credentials>`'
    };

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: headers,
      body,
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({
          error: "Callback: Failed to get token",
          e: response.statusText,
        });
    }

    // console.log('RESPONSE', response);

    const { access_token, expires_in, id_token, refresh_token } =
      await response.json();

    console.log(
      "access token",
      access_token,
      expires_in,
      id_token,
      refresh_token
    );

    // Store the access token in a secure cookie or session (not shown here)
    res.setHeader("Set-Cookie", [
      `newAccountsToken=${access_token}; HttpOnly; Path=/; Secure`,
      `idToken=${id_token}; HttpOnly; Path=/; Secure`,
    //   `expiresIn=${expires_in}; HttpOnly; Path=/; Secure`,
    //   `refreshToken=${refresh_token}; HttpOnly; Path=/; Secure`,
    ]);
    // res.setHeader("Set-Cookie", `refreshToken=${access_token}; HttpOnly; Path=/; Secure`);

    // Redirect to the home page or a dashboard
    res.redirect("/new-accounts");

    // Store the access token securely (e.g., in a session or database)
    // For simplicity, we'll just return it here
    res.status(200).json({}); // { accessToken });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to authenticate with Shopify", e: error });
  }
}
