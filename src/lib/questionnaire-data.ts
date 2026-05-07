export interface QuestionOption {
  zh: string;
  en: string;
}

export interface Question {
  id: string;
  zh: string;
  en: string;
  options: QuestionOption[];
  // Optional sub-section divider rendered above this question.
  // Used inside Section E to separate equity-readiness from bank-loan-readiness.
  groupHeader?: {
    zh: string;
    en: string;
    desc_zh?: string;
    desc_en?: string;
  };
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
      {
        id: 'Q26', zh: '股权结构？', en: 'Equity structure?',
        groupHeader: {
          zh: 'E1 · 股权资本就绪度',
          en: 'E1 · Equity Capital Readiness',
          desc_zh: '面向投资人的资本就绪度——VC、PE、战投、并购、上市路径。',
          desc_en: 'Readiness for equity investors — VC, PE, strategic, M&A, listing pathways.',
        },
        options: [o('没有','None'), o('大致有但不清楚','Rough unclear'), o('基本清楚','Basically clear'), o('较清晰','Fairly clear'), o('非常清晰','Very clear')],
      },
      { id: 'Q27', zh: '股东类型？', en: 'Shareholder type?', options: [o('全部创始人持有','All founder'), o('有历史口头安排','Historical verbal'), o('有少量外部股东','Some external'), o('有2轮以上投资人','2+ rounds investors'), o('有多轮投资人+员工持股计划','Multi-round + ESOP')] },
      { id: 'Q28', zh: '财务规范化？', en: 'Financial standardization?', options: [o('没有','None'), o('只有内部账','Internal only'), o('有基础财务报表','Basic statements'), o('有1年年度审计','1yr audit'), o('有2–3年审计/较规范财务体系','2–3yr audit')] },
      { id: 'Q29', zh: '资本动作意向？', en: 'Capital action intent?', options: [o('暂时不融资先经营','Operate first'), o('想梳理商业模式','Clarify model'), o('想做融资准备','Prepare fundraising'), o('想正式融资','Formally fundraise'), o('想做并购/被并购准备','M&A prep'), o('想走向上市路径','IPO path')] },
      { id: 'Q30', zh: '融资时间预期？', en: 'Fundraising timeline?', options: [o('1年后再看','After 1yr'), o('6–12个月','6–12mo'), o('3–6个月内','3–6mo'), o('已经在推进','Already in progress')] },
      { id: 'Q31', zh: '资本准备状态？', en: 'Capital readiness?', options: [o('还没开始准备','Not started'), o('有想法但没材料','Ideas no materials'), o('有基础资料但不完整','Basic incomplete'), o('已开始系统整理融资资料','Systematically organizing'), o('已能进入BP/路演准备','Ready for BP/roadshow')] },
      { id: 'Q32', zh: '融资最大障碍？', en: 'Biggest fundraising obstacle?', options: [o('团队不够','Team insufficient'), o('财务不规范','Financials not standard'), o('没有BP','No BP'), o('不会讲资本故事','Can\'t tell capital story'), o('缺乏投资人资源','Lack investor connections')] },
      // ── E2 · SME Bank Loan Readiness (option strings must match SCORE_MAP) ──
      {
        id: 'Q36',
        zh: '最新一年的税前利润 (PBT) 利润率？',
        en: 'Latest annual profit-before-tax (PBT) margin?',
        groupHeader: {
          zh: 'E2 · SME 银行贷款就绪度',
          en: 'E2 · SME Bank Loan Readiness',
          desc_zh: '按银行 SME 贷款的五大核心准则评估：DSCR > 1.0x、资产负债率 < 3.0x、信用卡使用率 < 70%、营收利润上升、银行流水良好。',
          desc_en: "Scored against the bank's 5 core SME-loan criteria: DSCR > 1.0x, gearing < 3.0x, credit-card utilisation < 70%, uptrend revenue/profit, healthy bank statements.",
        },
        options: [
          o('亏损 / 负 PBT', 'Loss / negative PBT'),
          o('盈亏平衡 (利润率 0–3%)', 'Break-even (margin 0–3%)'),
          o('利润率 3–8%', 'Margin 3–8%'),
          o('利润率 8–15%', 'Margin 8–15%'),
          o('利润率 > 15%', 'Margin > 15%'),
        ],
      },
      {
        id: 'Q37',
        zh: '董事个人信用卡使用率？(银行红线 > 70%)',
        en: "Director's personal credit-card utilisation? (bank red-line > 70%)",
        options: [
          o('> 70% (银行不接受)', '> 70% (bank rejects)'),
          o('50–70%', '50–70%'),
          o('30–50%', '30–50%'),
          o('10–30%', '10–30%'),
          o('< 10% 或不使用信用卡', '< 10% or no credit-card use'),
        ],
      },
      {
        id: 'Q38',
        zh: '公司或董事是否有正在进行的法律诉讼？',
        en: 'Any ongoing legal cases against the company or directors?',
        options: [
          o('是，公司和董事都有', 'Yes — company and directors'),
          o('是，仅公司有', 'Yes — company only'),
          o('是，仅董事个人有', 'Yes — director only'),
          o('历史上有但已结案', 'Past cases, all resolved'),
          o('完全没有', 'None at all'),
        ],
      },
      {
        id: 'Q39',
        zh: '公司注册成立至今多少年？(银行最低要求 > 1 年)',
        en: 'Years since company incorporation? (bank minimum > 1 year)',
        options: [
          o('< 1 年 (低于银行最低要求)', '< 1 year (below bank minimum)'),
          o('1–2 年', '1–2 years'),
          o('2–3 年', '2–3 years'),
          o('3–5 年', '3–5 years'),
          o('> 5 年', '> 5 years'),
        ],
      },
      {
        id: 'Q40',
        zh: '公司银行月结单平均月末余额（占月入百分比）？(银行偏好 5–20%)',
        en: 'Average month-end bank balance as % of monthly deposits? (bank prefers 5–20%)',
        options: [
          o('几乎为零或负 (经常透支)', 'Near zero or negative (often overdrawn)'),
          o('< 5% 月入', '< 5% of monthly deposits'),
          o('5–10% 月入', '5–10% of monthly deposits'),
          o('10–20% 月入 (银行偏好区间)', '10–20% (bank sweet spot)'),
          o('> 20% 月入', '> 20% of monthly deposits'),
        ],
      },
      {
        id: 'Q41',
        zh: '公司总借贷相对股东权益的比率（资产负债率）？(银行红线 > 3.0x)',
        en: 'Total borrowings ÷ shareholder equity (gearing ratio)? (bank red-line > 3.0x)',
        options: [
          o('> 3.0x (违反银行准则)', '> 3.0x (fails bank gearing test)'),
          o('2.0–3.0x', '2.0–3.0x'),
          o('1.0–2.0x', '1.0–2.0x'),
          o('0.5–1.0x', '0.5–1.0x'),
          o('< 0.5x 或无借贷', '< 0.5x or debt-free'),
        ],
      },
      {
        id: 'Q42',
        zh: 'EBITDA ÷ 年度借贷偿还总额 (DSCR)？(银行红线 < 1.0x)',
        en: 'EBITDA ÷ annual borrowing commitments (DSCR)? (bank red-line < 1.0x)',
        options: [
          o('< 1.0x (无法覆盖偿债)', '< 1.0x (cannot cover debt)'),
          o('1.0–1.25x (勉强覆盖)', '1.0–1.25x (barely covers)'),
          o('1.25–1.5x', '1.25–1.5x'),
          o('1.5–2.0x', '1.5–2.0x'),
          o('> 2.0x (强偿债能力)', '> 2.0x (strong)'),
        ],
      },
      {
        id: 'Q43',
        zh: '公司最新股东权益 (Shareholder Equity)？',
        en: "Company's latest shareholder equity?",
        options: [
          o('负值 (技术性资不抵债)', 'Negative (technically insolvent)'),
          o('< RM 50 万', '< RM 500K'),
          o('RM 50 万 – 200 万', 'RM 500K – 2M'),
          o('RM 200 万 – 1000 万', 'RM 2M – 10M'),
          o('> RM 1000 万', '> RM 10M'),
        ],
      },
      {
        id: 'Q44',
        zh: '现有借贷的还款记录？(银行核查 CCRIS)',
        en: 'Repayment record on existing borrowings? (bank checks CCRIS)',
        options: [
          o('经常迟缴 / CCRIS 不良记录', 'Frequent late / CCRIS adverse'),
          o('近 12 个月内有迟缴', 'Late payment within last 12 months'),
          o('近 12 个月无迟缴，更早曾有', '12 months clean, older history of late'),
          o('近 24 个月无迟缴', '24 months clean'),
          o('从未迟缴', 'Never late'),
        ],
      },
      {
        id: 'Q45',
        zh: '近 2–3 年公司营收和利润趋势？(银行要求上升或稳定)',
        en: 'Revenue & profit trend over the past 2–3 years? (bank requires uptrend or stable)',
        options: [
          o('双双下降', 'Both declining'),
          o('波动较大，无明显趋势', 'Volatile, no clear trend'),
          o('大致持平', 'Roughly flat'),
          o('稳定增长', 'Stable growth'),
          o('持续高速增长', 'Strong sustained growth'),
        ],
      },
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
