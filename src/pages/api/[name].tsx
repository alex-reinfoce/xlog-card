import type { NextApiRequest, NextApiResponse } from "next";
import satori from "satori";
import dayjs from "dayjs";

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

const getArticleCount = async (name: string) => {
  return fetch(
    `https://alex-programer.xlog.app/api/pages?site=${name}&type=post&visibility=published&useStat=true`
  ).then((res) => res.json());
};

const getFollowerCount = async (characterId: string) => {
  return fetch(
    `https://indexer.crossbell.io/v1/characters/${characterId}/backlinks?limit=0`
  ).then((res) => res.json());
};

const getCommentsCount = async (characterId: string) => {
  return fetch(
    `https://indexer.crossbell.io/v1/notes?limit=0&toCharacterId=${characterId}`
  ).then((res) => res.json());
};

const View: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style = {} }) => {
  return <div style={{ display: "flex", ...style }}>{children}</div>;
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
  if (!metaData || !metaData.characterId) {
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.status(200).send("");
    return;
  }

  const characterId = metaData.characterId;

  const cards = [
    {
      id: "article",
      title: "Articles",
      value: 0,
      getData: async () => {
        const data = await getArticleCount(name);
        return data.total;
      },
    },
    {
      id: "comment",
      title: "Comments",
      value: 0,
      getData: async () => {
        const { count } = await getCommentsCount(characterId);
        return count;
      },
    },
    {
      id: "follower",
      title: "Followers",
      value: 0,
      getData: async () => {
        const { count } = await getFollowerCount(characterId);
        return count;
      },
    },
    {
      id: "viewCount",
      title: "Visits",
      value: 0,
      getData: async () => {
        const { viewNoteCount } = await getViewCount(characterId);
        return viewNoteCount;
      },
    },
    {
      id: "site",
      title: "Days the site is running",
      value: "0",
      getData: async () => {
        const day = dayjs(new Date()).diff(dayjs(metaData.createdAt), "day");
        return day;
      },
    },
  ];

  let showCards: (typeof cards)[number][] = [];

  if (!layout) {
    showCards = [...cards];
  } else {
    layout.split("-").forEach((id) => {
      const card = cards.find((card) => card.id === id);
      if (card) {
        showCards.push(card);
      }
    });
  }

  for (const item of showCards) {
    item.value = await item.getData();
  }

  const font = await loadFont(req);

  const svg = await satori(
    <View
      style={{ width: "100%", height: "100%", flexWrap: "wrap", padding: 10 }}
    >
      {showCards.map((card) => {
        return (
          <View
            style={{
              width: "33.33%",
              flexWrap: "wrap",
              padding: 10,
            }}
            key={card.id}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                backgroundColor:
                  theme === "light" ? "rgb(241, 245, 249)" : "rgb(15,23,42)",
                flexWrap: "wrap",
                borderRadius: "0.5rem",
                padding: 10,
              }}
            >
              <View
                style={{
                  width: "100%",
                  fontSize: "16px",
                  color:
                    theme === "light"
                      ? "rgb(39, 39, 42)"
                      : "rgb(228, 228, 231)",
                }}
              >
                {card.title}
              </View>
              <View
                style={{
                  width: "100%",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color:
                    theme === "light"
                      ? "rgb(39, 39, 42)"
                      : "rgb(228, 228, 231)",
                }}
              >
                {card.value}
              </View>
            </View>
          </View>
        );
      })}
    </View>,
    {
      width: 700,
      height: 200,
      embedFont: true,
      fonts: [
        {
          name: "Roboto",
          data: font,
          weight: 400,
          style: "normal",
          lang: "zh-CN",
        },
      ],
    }
  );

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.status(200).send(svg);
}
