// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import satori from "satori";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name } = req.query;

  const font = await fetch(
    `${req.headers["x-forwarded-proto"]}://${req.headers.host}/Roboto-Regular.ttf`
  ).then((res) => res.arrayBuffer());

  const svg = await satori(<div>123</div>, {
    width: 100,
    height: 100,
    fonts: [
      {
        name: "Roboto",
        data: font,
        weight: 400,
        style: "normal",
      },
    ],
  });

  res.setHeader("Content-Type", "image/svg+xml");
  res.status(200).send(svg);
}
