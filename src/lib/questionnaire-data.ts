export interface QuestionOption {
  zh: string;
  en: string;
}

export interface Question {
  id: string;
  zh: string;
  en: string;
  options: QuestionOption[];
}

function o(zh: string, en: string): QuestionOption {
  return { zh, en };
}

export const SECTIONS: Record<string, { title_zh: string; title_en: string; questions: Question[] }> = {
  a: {
    title_zh: '企业基础画像',
    title_en: 'Enterprise Profile',
    questions: [
      { id: 'Q01', zh: '你的企业目前成立多久？', en: 'How long has your enterprise been established?', options: [o('还未正式开始','Not yet started'), o('0–1年','0–1 year'), o('1–3年','1–3 years'), o('3–5年','3–5 years'), o('5年以上','5+ years')] },
      { id: 'Q02', zh: '创始人在本行业累计经验？', en: "Founder's cumulative industry experience?", options: [o('0–1年','0–1 year'), o('1–3年','1–3 years'), o('3–5年','3–5 years'), o('5–10年','5–10 years'), o('10年以上','10+ years')] },
      { id: 'Q03', zh: '行业类别？', en: 'Industry category?', options: [o('消费零售','Consumer Retail'), o('餐饮连锁','F&B Chain'), o('制造业','Manufacturing'), o('服务业','Services'), o('SaaS/科技','SaaS/Tech'), o('教育/培训','Education'), o('医疗/健康','Healthcare'), o('平台/交易撮合','Platform/Marketplace')] },
      { id: 'Q04', zh: '年营收区间？', en: 'Annual revenue range?', options: [o('还没有稳定营收','No stable revenue'), o('100万以下','Below 1M'), o('100万–500万','1M–5M'), o('500万–3000万','5M–30M'), o('3000万–1亿','30M–100M'), o('1亿以上','Above 100M')] },
      { id: 'Q05', zh: '经营利润状态？', en: 'Profit status?', options: [o('还在亏损','Still losing money'), o('偶尔盈利','Occasional profit'), o('已经能稳定成交','Stable transactions'), o('持续稳定盈利','Consistent profit'), o('盈利能力较强','Strong profitability')] },
      { id: 'Q06', zh: '团队规模？', en: 'Team size?', options: [o('5人以下','Below 5'), o('6–10人','6–10'), o('11–30人','11–30'), o('31–100人','31–100'), o('101–300人','101–300'), o('300人以上','300+')] },
      { id: 'Q07', zh: '经营状态？', en: 'Business state?', options: [o('还在试模式','Testing model'), o('已经能稳定成交','Stable transactions'), o('正在扩张','Expanding'), o('正在准备融资/资本动作','Preparing capital action')] },
      { id: 'Q08', zh: '企业更大目标？', en: 'Biggest goal?', options: [o('先活下来','Survive'), o('先稳定盈利','Stabilize profit'), o('先复制扩张','Replicate & expand'), o('先做高估值逻辑','Build valuation'), o('先进入融资/资本路径','Enter capital path')] },
    ],
  },
  b: {
    title_zh: '基因结构',
    title_en: 'Gene Structure',
    questions: [
      { id: 'Q09', zh: '增长最依赖什么？', en: 'Growth depends on?', options: [o('创始人本人','Founder'), o('少数销售高手','Few sales experts'), o('单一渠道','Single channel'), o('单一产品','Single product'), o('团队与系统共同驱动','Team + system')] },
      { id: 'Q10', zh: '最大驱动力？', en: 'Main driving force?', options: [o('创始人个人能力','Founder ability'), o('创始人+少数核心骨干','Founder + key people'), o('核心团队','Core team'), o('团队+组织机制','Team + org structure'), o('已开始系统化运转','Systematized')] },
      { id: 'Q11', zh: '企业定位清晰度？', en: 'Positioning clarity?', options: [o('还比较模糊','Fuzzy'), o('大致清楚','Generally clear'), o('较清楚','Fairly clear'), o('清楚且差异化明显','Clear + differentiated'), o('已形成行业标签/品牌认知','Industry label/brand')] },
      { id: 'Q12', zh: '离开创始人能否运转？', en: 'Run without founder?', options: [o('几乎不能','Almost cannot'), o('较难','Difficult'), o('一部分可以','Partially'), o('大部分可以','Mostly'), o('基本可以','Basically yes')] },
      { id: 'Q13', zh: '是否有管理层？', en: 'Management layer?', options: [o('没有','None'), o('有少数核心骨干','Few key people'), o('有基础管理层','Basic management'), o('有较成熟管理层','Mature management'), o('已有系统化管理团队+决策机制','Systematic management + governance')] },
    ],
  },
  c: {
    title_zh: '商业模式结构',
    title_en: 'Business Model Structure',
    questions: [
      { id: 'Q14', zh: '收入来源？', en: 'Revenue source?', options: [o('单次交易','One-time'), o('长期复购','Repeat purchase'), o('订阅/月费','Subscription'), o('项目制收入','Project-based'), o('平台抽成','Platform commission'), o('多种收入组合','Multiple revenue mix')] },
      { id: 'Q15', zh: '复制成功率？', en: 'Replication success?', options: [o('很低几乎靠人','Very low'), o('有机会但不稳定','Possible unstable'), o('中等部分可复制','Medium partial'), o('较高已有初步方法','High initial methods'), o('很高已有成熟SOP','Very high mature SOP')] },
      { id: 'Q16', zh: '成交标准化？', en: 'Sales standardization?', options: [o('基本没有','None'), o('有一些经验但不稳定','Some unstable'), o('有基础流程','Basic process'), o('已有可训练SOP','Trainable SOP'), o('已能复制给不同团队','Replicable to teams')] },
      { id: 'Q17', zh: '交付独立性？', en: 'Delivery independence?', options: [o('不能','Cannot'), o('较难','Difficult'), o('一部分可以','Partially'), o('大部分可以','Mostly'), o('基本完全可以','Basically fully')] },
      { id: 'Q18', zh: '客户复购/转介绍？', en: 'Customer retention?', options: [o('很少','Rarely'), o('偶尔','Occasionally'), o('一般','Average'), o('较高','Fairly high'), o('很高','Very high')] },
      { id: 'Q19', zh: '客户来源？', en: 'Customer source?', options: [o('主要靠创始人/熟人资源','Founder network'), o('主要靠转介绍','Referrals'), o('主要靠销售主动开发','Sales outbound'), o('主要靠渠道/平台/品牌流量','Channel/platform'), o('多渠道较均衡','Multi-channel balanced')] },
      { id: 'Q20', zh: '已验证的增长信号？', en: 'Validated growth signal?', options: [o('没有','None'), o('有尝试但未验证','Tried unvalidated'), o('有少量验证','Some validation'), o('有明显验证','Clear validation'), o('已形成区域复制基础','Regional replication base')] },
    ],
  },
  d: {
    title_zh: '估值结构',
    title_en: 'Valuation Structure',
    questions: [
      { id: 'Q21', zh: '增长方式？', en: 'Growth method?', options: [o('多开店/多开点','More locations'), o('增加销售团队','More sales'), o('增加经销商/渠道','More distributors'), o('产品升级与客户复购','Product upgrade'), o('平台化连接更多角色','Platform'), o('区域扩张/跨国复制','Regional expansion')] },
      { id: 'Q22', zh: '市场机会？', en: 'Market opportunity?', options: [o('本地刚需市场','Local necessity'), o('区域连锁机会','Regional chain'), o('全国性品牌机会','National brand'), o('东南亚机会','SEA'), o('全球性机会','Global'), o('目前还不清楚','Not clear')] },
      { id: 'Q23', zh: '资金优先投入？', en: 'Capital priority?', options: [o('获客','Customer acquisition'), o('团队建设','Team building'), o('门店/网点扩张','Location expansion'), o('系统/技术','Systems/tech'), o('供应链/交付能力','Supply chain'), o('品牌与市场','Brand & marketing'), o('暂时还不清楚','Not clear')] },
      { id: 'Q24', zh: '增长核心逻辑？', en: 'Growth core logic?', options: [o('稳定营收','Stable revenue'), o('成本优化','Cost optimization'), o('多城市复制','Multi-city replication'), o('强品牌/流量/平台效应','Strong brand/platform effect')] },
      { id: 'Q25', zh: '企业类型？', en: 'Enterprise type?', options: [o('靠老板赚钱的经营型公司','Boss-dependent'), o('靠产品赚钱的业务型公司','Product-driven'), o('可复制的成长型公司','Replicable growth'), o('可融资的资本型公司','Fundable capital'), o('具备平台化潜力的高估值公司','Platform high-value')] },
    ],
  },
  e: {
    title_zh: '融资结构',
    title_en: 'Financing Structure',
    questions: [
      { id: 'Q26', zh: '股权结构？', en: 'Equity structure?', options: [o('没有','None'), o('大致有但不清楚','Rough unclear'), o('基本清楚','Basically clear'), o('较清晰','Fairly clear'), o('非常清晰','Very clear')] },
      { id: 'Q27', zh: '股东类型？', en: 'Shareholder type?', options: [o('全部创始人持有','All founder'), o('有历史口头安排','Historical verbal'), o('有少量外部股东','Some external'), o('有2轮以上投资人','2+ rounds investors'), o('有多轮投资人+员工持股计划','Multi-round + ESOP')] },
      { id: 'Q28', zh: '财务规范化？', en: 'Financial standardization?', options: [o('没有','None'), o('只有内部账','Internal only'), o('有基础财务报表','Basic statements'), o('有1年年度审计','1yr audit'), o('有2–3年审计/较规范财务体系','2–3yr audit')] },
      { id: 'Q29', zh: '资本动作意向？', en: 'Capital action intent?', options: [o('暂时不融资先经营','Operate first'), o('想梳理商业模式','Clarify model'), o('想做融资准备','Prepare fundraising'), o('想正式融资','Formally fundraise'), o('想做并购/被并购准备','M&A prep'), o('想走向上市路径','IPO path')] },
      { id: 'Q30', zh: '融资时间预期？', en: 'Fundraising timeline?', options: [o('1年后再看','After 1yr'), o('6–12个月','6–12mo'), o('3–6个月内','3–6mo'), o('已经在推进','Already in progress')] },
      { id: 'Q31', zh: '资本准备状态？', en: 'Capital readiness?', options: [o('还没开始准备','Not started'), o('有想法但没材料','Ideas no materials'), o('有基础资料但不完整','Basic incomplete'), o('已开始系统整理融资资料','Systematically organizing'), o('已能进入BP/路演准备','Ready for BP/roadshow')] },
      { id: 'Q32', zh: '融资最大障碍？', en: 'Biggest fundraising obstacle?', options: [o('团队不够','Team insufficient'), o('财务不规范','Financials not standard'), o('没有BP','No BP'), o('不会讲资本故事','Can\'t tell capital story'), o('缺乏投资人资源','Lack investor connections')] },
    ],
  },
  f: {
    title_zh: '退出与上市结构',
    title_en: 'Exit & IPO Structure',
    questions: [
      { id: 'Q33', zh: '退出方向？', en: 'Exit direction?', options: [o('长期经营不谈退出','Long-term no exit'), o('未来股权交易','Equity transaction'), o('未来兼并收购','M&A'), o('未来融资后再退出','Fundraise then exit'), o('未来上市退出','IPO exit')] },
      { id: 'Q34', zh: '上市准备状态？', en: 'IPO readiness?', options: [o('还非常早不应现在讨论','Very early'), o('先把经营和模式跑顺','Fix operations first'), o('可以开始补治理/财务/股权基础','Start governance'), o('可以开始做上市前体检','Pre-IPO checkup'), o('已开始认真思考上市路径','Seriously considering IPO')] },
      { id: 'Q35', zh: '报告期望？（多选最多2项）', en: 'Report focus? (multi-select max 2)', options: [o('看清企业卡在哪','See bottlenecks'), o('看清能不能复制扩张','Replication potential'), o('看清有没有融资可能','Fundraising potential'), o('看清有没有高估值潜力','Valuation potential'), o('看清能不能进入BP/路演阶段','BP/roadshow readiness'), o('看清未来上市路径','IPO path')] },
    ],
  },
};

/** Look up English translation for a Chinese answer value */
export function translateAnswer(questionId: string, zhValue: string): string {
  for (const section of Object.values(SECTIONS)) {
    const q = section.questions.find((q) => q.id === questionId);
    if (q) {
      const opt = q.options.find((o) => o.zh === zhValue);
      if (opt) return opt.en;
      break;
    }
  }
  return zhValue; // fallback to original
}
