import type { NextApiRequest, NextApiResponse } from "next";
import satori from "satori";

const loadFont = async (req: NextApiRequest) => {
  return fetch(
    `${req.headers["x-forwarded-proto"]}://${req.headers.host}/Roboto-Regular.ttf`
  ).then((res) => res.arrayBuffer());
};

const getMeta = async (name: string) => {
  return fetch(
    `https://indexer.crossbell.io/v1/handles/${name}/character`
  ).then((res) => res.json());
};

const getViewCount = async (characterId: string) => {
  return fetch(
    `https://indexer.crossbell.io/v1/stat/characters/${characterId}`
  ).then((res) => res.json());
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, theme, layout } = req.query as {
    name: string;
    theme: string;
    layout: string;
  };

  const metaData = await getMeta(name);
  const characterId = metaData.characterId;

  const cards = [
    {
      id: "articles",
      title: "文章总数",
      getData: async () => {},
    },
    {
      id: "articles",
      title: "评论总数",
      getData: async () => {},
    },
    {
      id: "articles",
      title: "关注者总数",
      getData: async () => {},
    },
    {
      id: "viewNoteCount",
      title: "浏览总数",
      getData: async () => {
        const { viewNoteCount } = await getViewCount(characterId);
        return viewNoteCount;
      },
    },
    {
      id: "articles",
      title: "站点运行时间",
      getData: async () => {},
    },
  ];

  // 浏览总数
  const font = await loadFont(req);
  const svg = await satori(<div style={{ display: "flex" }}>666</div>, {
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
