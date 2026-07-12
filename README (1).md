# Meow Forge 首页 v0.8 — Flat Galaxy System

- 记录者：GPT-Web (Drive)
- 项目：Meow Forge 网站原型
- 日期：2026-07-12
- 基线：已确认的 v0.7 页面结构、信息节奏和 GSAP 基础
- 当前版本：覆盖式 v0.8，不建立 v0.8.1

## 视觉与产品口径

v0.8 使用 2D / Flat Galaxy System 语言表达产品关系，不模拟真实太空，也不使用伪 3D 球体、玻璃高光或 NASA 风格。星体类型与成熟度分别记录：Brain2、Meow Installer 为 Planet；Meowdesk 为 Orbital Hub；MeowViewer、Meow Dev Helper、Meow Protector 为 Candidate；Coming Soon 为未来占位。

## 本轮覆盖内容

1. **Part 1 / Hero 与 Forge Core**
   - Hero 控制在单个桌面视口内，删除展开后产生的无效留白。
   - Core 展开尺度缩小，四个来源圆与两个产品圆均落在同一视觉页面内。
   - 轨道和动态连线增强，但仍保持纯平面几何表达。
   - 两个轨道对象使用正式 Meow Forge Symbol。
   - “打开产品星系图”进入 CTA 行；“滚动查看产品”进入 Current System 行。

2. **Part 2 / 产品目录**
   - 改为编辑式滚轮驱动产品舞台：左侧纵向大字号产品名称，右侧独立预览框。
   - 桌面端由 ScrollTrigger 固定舞台，滚轮依次切换七个产品对象；最后一项完成后恢复正常页面滚动。
   - 预览图、标题、状态、说明和进度轨同步进行 GSAP 过渡。
   - 缺少正式材料的候选产品仅显示明确占位，不编造功能。
   - 手机和平板回退为正常纵向页面，不强制固定滚动。

3. **Part 间过渡**
   - Hero 离场采用左右分离式位移与淡出。
   - 后续 Part 使用平面色条 wipe、内容上移和透明度变化进入。
   - 尊重 `prefers-reduced-motion`。

4. **双语与品牌资产**
   - 产品名保持原文；导航、类型、状态、说明、按钮与主要界面文字支持中英切换。
   - Header 使用正式高分辨率 Symbol 与 Wordmark 组合，同时保持原有占位尺寸与位置。

## 文件

- `index.html`
- `galaxy-map.html`
- `brain2.html`
- `meowdesk.html`
- `about.html`
- `build-log.html`
- `styles.css`
- `script.js`
- 六份单文件预览
- `manifest-v0.8.json`
- `meow-forge-home-v0.8.zip`

## 验收边界

- 已进行桌面和窄屏浏览器运行检查、JavaScript 语法检查及横向溢出检查。
- 支付、授权、联系表单和自动交付仍未上线。
- Meow Protector 当前仅保留用户指定名称和候选占位，正式产品定位需 Shizuku 决策。
- Drive 云端写入可由 GPT-Web 回读确认；设备 A/B 本地同步状态不在此处推定。
