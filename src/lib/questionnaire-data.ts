// Questionnaire sections and questions for the Unicorn Diagnostic

export const SECTIONS: Record<string, { title_zh: string; title_en: string; questions: Question[] }> = {
  a: {
    title_zh: '企业当前基础',
    title_en: 'Current Enterprise Foundation',
    questions: [
      { id: 'Q01', zh: '你的企业目前成立多久？', en: 'How long has your enterprise been established?', options: ['还未正式开始', '0–1年', '1–3年', '3–5年', '5年以上'] },
      { id: 'Q02', zh: '创始人在本行业累计经验大约多久？', en: "Founder's cumulative industry experience?", options: ['0–1年', '1–3年', '3–5年', '5–10年', '10年以上'] },
      { id: 'Q03', zh: '你所在的行业属于哪一类？', en: 'Industry category?', options: ['消费零售', '餐饮连锁', '制造业', '服务业', 'SaaS / 科技', '教育 / 培训', '医疗 / 健康', '平台 / 交易撮合'] },
      { id: 'Q04', zh: '你目前的年营收大约在哪个区间？', en: 'Annual revenue range?', options: ['还没有稳定营收', '100万以下', '100万–500万', '500万–3000万', '3000万–1亿', '1亿以上'] },
      { id: 'Q05', zh: '你目前的经营状态最接近哪一种？', en: 'Current business state?', options: ['还在试模式', '已经能稳定成交', '已经稳定盈利', '正在扩张', '正在准备融资 / 资本动作'] },
      { id: 'Q06', zh: '目前企业的增长最依赖什么？', en: 'What drives growth most?', options: ['创始人本人', '少数销售高手', '单一渠道', '单一产品', '团队与系统共同驱动'] },
    ],
  },
  b: {
    title_zh: '基因结构',
    title_en: 'Gene Structure',
    questions: [
      { id: 'Q07', zh: '你觉得企业目前最大的驱动力更接近哪一种？', en: "Enterprise's main driving force?", options: ['创始人个人能力', '创始人 + 少数核心骨干', '核心团队', '团队 + 组织机制', '已开始系统化运转'] },
      { id: 'Q08', zh: '你的企业定位目前更接近哪一种？', en: 'Enterprise positioning clarity?', options: ['还比较模糊', '大致清楚', '较清楚', '清楚且差异化明显', '已形成行业标签 / 品牌认知'] },
      { id: 'Q09', zh: '如果离开创始人，企业还能否继续运转？', en: 'Can enterprise run without founder?', options: ['几乎不能', '较难', '一部分可以', '大部分可以', '基本可以'] },
    ],
  },
  c: {
    title_zh: '商业模式结构',
    title_en: 'Business Model Structure',
    questions: [
      { id: 'Q10', zh: '你的收入主要来自什么？', en: 'Main revenue source?', options: ['单次交易', '长期复购', '订阅 / 月费', '项目制收入', '平台抽成', '多种收入组合'] },
      { id: 'Q11', zh: '如果把门店/团队/业务复制到另一个城市，成功率大概如何？', en: 'Replication success rate?', options: ['很低，几乎靠人', '有机会，但不稳定', '中等，部分可复制', '较高，已有初步方法', '很高，已有成熟 SOP'] },
      { id: 'Q12', zh: '你的成交过程，是否已经有比较标准化的方法？', en: 'Standardized sales process?', options: ['基本没有', '有一些经验，但不稳定', '有基础流程', '已有可训练 SOP', '已能复制给不同团队'] },
      { id: 'Q13', zh: '你的交付过程，是否能在不依赖创始人的情况下稳定完成？', en: 'Delivery without founder?', options: ['不能', '较难', '一部分可以', '大部分可以', '基本完全可以'] },
      { id: 'Q14', zh: '客户在第一次购买后，是否有继续消费/升级/转介绍的可能？', en: 'Customer repeat/upgrade/referral?', options: ['很少', '偶尔', '一般', '较高', '很高'] },
      { id: 'Q15', zh: '你当前的客户来源更接近哪一种？', en: 'Customer acquisition source?', options: ['主要靠创始人 / 熟人资源', '主要靠转介绍', '主要靠销售主动开发', '主要靠渠道 / 平台 / 品牌流量', '多渠道较均衡'] },
    ],
  },
  d: {
    title_zh: '增长与估值潜力',
    title_en: 'Growth & Valuation Potential',
    questions: [
      { id: 'Q16', zh: '你认为你的企业未来最大的增长方式是哪一种？', en: 'Biggest growth method?', options: ['多开店 / 多开点', '增加销售团队', '增加经销商 / 渠道', '产品升级与客户复购', '平台化连接更多角色', '区域扩张 / 跨国复制'] },
      { id: 'Q17', zh: '你所在市场最大的机会属于哪一类？', en: "Market's biggest opportunity?", options: ['本地刚需市场', '区域连锁机会', '全国性品牌机会', '东南亚机会', '全球性机会', '目前还不清楚'] },
      { id: 'Q18', zh: '如果给你更多资金，你最希望优先投入在哪？', en: 'Priority investment?', options: ['获客', '团队建设', '门店 / 网点扩张', '系统 / 技术', '供应链 / 交付能力', '品牌与市场', '暂时还不清楚'] },
      { id: 'Q19', zh: '你的企业现在更像哪一种公司？', en: 'Enterprise type?', options: ['靠老板赚钱的经营型公司', '靠产品赚钱的业务型公司', '可复制的成长型公司', '可融资的资本型公司', '具备平台化潜力的高估值公司'] },
      { id: 'Q20', zh: '你觉得企业现在更大的目标是什么？', en: 'Current biggest goal?', options: ['先活下来', '先稳定盈利', '先复制扩张', '先做高估值逻辑', '先进入融资 / 资本路径'] },
    ],
  },
  e: {
    title_zh: '融资与资本准备',
    title_en: 'Financing & Capital Readiness',
    questions: [
      { id: 'Q21', zh: '你目前是否已有清晰的股权结构？', en: 'Clear equity structure?', options: ['没有', '大致有，但不清楚', '基本清楚', '较清晰', '非常清晰'] },
      { id: 'Q22', zh: '你目前是否有规范化财务报表/审计基础？', en: 'Standardized financials/audit?', options: ['没有', '只有内部账', '有基础财务报表', '有1年年度审计', '有2–3年审计 / 较规范财务体系', '有5年以上审计 / 较成熟规范体系'] },
      { id: 'Q23', zh: '你未来12–24个月最想做的资本动作是什么？', en: 'Capital action in next 12-24 months?', options: ['暂时不融资，先经营', '想梳理商业模式', '想做融资准备', '想正式融资', '想做并购 / 被并购准备', '想走向上市路径'] },
      { id: 'Q24', zh: '你当前更接近哪一种资本准备状态？', en: 'Capital readiness state?', options: ['还没开始准备', '有想法但没材料', '有基础资料但不完整', '已开始系统整理融资资料', '已能进入 BP / 路演准备'] },
    ],
  },
  f: {
    title_zh: '退出与上市方向',
    title_en: 'Exit & Listing Direction',
    questions: [
      { id: 'Q25', zh: '你未来更希望企业走向哪一种结果？', en: 'Desired enterprise outcome?', options: ['长期经营，不谈退出', '未来股权交易', '未来兼并收购', '未来融资后再退出', '未来上市退出'] },
      { id: 'Q26', zh: '你觉得公司距离"上市准备"更接近哪一种状态？', en: 'Distance to IPO readiness?', options: ['还非常早，不应现在讨论', '先把经营和模式跑顺', '可以开始补治理 / 财务 / 股权基础', '可以开始做上市前体检', '已开始认真思考上市路径'] },
    ],
  },
};

export interface Question {
  id: string;
  zh: string;
  en: string;
  options: string[];
}
