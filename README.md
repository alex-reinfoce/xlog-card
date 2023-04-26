# xlog card

![light](light.png)

![dark](dark.png)

## 使用方法

### 获取个人的 xlog 名称

![](guid.png)

复制自己设置的名称，和这个接口对上即可

### 指定一个主题

```shell
https://xlog-card.vercel.app/api/Alex-Programer?theme=light
```

### 根据系统主题来切换

```html
<picture>
  <source
    media="(prefers-color-scheme: light)"
    srcset="https://xlog-card.vercel.app/api/diygod?theme=light"
  />
  <source
    media="(prefers-color-scheme: dark)"
    srcset="https://xlog-card.vercel.app/api/diygod?theme=dark"
  />
  <img src="https://xlog-card.vercel.app/api/diygod?theme=light" alt="" />
</picture>
```
