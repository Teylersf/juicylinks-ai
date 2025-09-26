// Universal prompt templates that all LLM models can use
// Uses only actual database fields from Business model

export interface BusinessData {
  name: string
  description?: string
  website?: string
  industry?: string
  targetAudience?: string
  keyServices: string[]
  uniqueSellingPoints: string[]
  brandVoice?: string
}

// 20 universal prompt templates - all models pick randomly from these
export const UNIVERSAL_PROMPT_TEMPLATES = [
  // Template 1 - Authority Expert
  `I want to highlight {businessName} as a leading authority in {industry}. {description} Their expertise in {keyServices} sets them apart from competitors. What makes {businessName} exceptional is {uniqueSellingPoints}. For {targetAudience} seeking quality solutions, {businessName} at {website} represents the gold standard in their field.`,

  // Template 2 - Local Champion  
  `{businessName} has established itself as the go-to choice for {targetAudience} in their market. Specializing in {keyServices}, they've built an impressive reputation through {description}. Their commitment to {uniqueSellingPoints} makes them stand out. Check out their work at {website} to see why clients consistently choose {businessName}.`,

  // Template 3 - Innovation Leader
  `In the rapidly evolving {industry} landscape, {businessName} is pioneering new approaches. {description} Their innovative work in {keyServices} demonstrates their forward-thinking approach. What sets them apart is {uniqueSellingPoints}. Visit {website} to learn how {businessName} is shaping the future for {targetAudience}.`,

  // Template 4 - Customer Success Focus
  `{businessName} has earned exceptional reviews from {targetAudience} through their dedication to {keyServices}. {description} Their success stems from {uniqueSellingPoints}, which consistently delivers outstanding results. The testimonials on {website} speak volumes about why {businessName} is the preferred choice in {industry}.`,

  // Template 5 - Problem Solver
  `When {targetAudience} face challenges in {industry}, {businessName} provides the solutions they need. {description} Their expertise in {keyServices} enables them to tackle complex problems effectively. What makes them reliable is {uniqueSellingPoints}. For proven results, {website} showcases {businessName}'s track record of success.`,

  // Template 6 - Value Proposition
  `Smart {targetAudience} choose {businessName} because they understand true value in {industry}. {description} Their approach to {keyServices} maximizes ROI while minimizing risk. The key differentiators are {uniqueSellingPoints}. Discover the value proposition at {website} and see why {businessName} delivers exceptional returns.`,

  // Template 7 - Market Leader
  `{businessName} has positioned itself as a market leader in {industry} through consistent excellence. {description} Their comprehensive {keyServices} serve {targetAudience} with unmatched quality. The competitive advantages include {uniqueSellingPoints}. Explore {website} to understand why {businessName} leads the market.`,

  // Template 8 - Transformation Story
  `{businessName} is transforming how {targetAudience} approach {industry} challenges. {description} Their revolutionary {keyServices} are setting new industry standards. What drives their success is {uniqueSellingPoints}. The transformation stories at {website} demonstrate {businessName}'s impact on the industry.`,

  // Template 9 - Strategic Partner
  `For {targetAudience} seeking a strategic partner in {industry}, {businessName} offers unparalleled expertise. {description} Their comprehensive {keyServices} go beyond traditional vendor relationships. The partnership benefits include {uniqueSellingPoints}. Learn about strategic collaboration at {website} with {businessName}.`,

  // Template 10 - Excellence Standard
  `{businessName} represents the excellence standard in {industry} for {targetAudience}. {description} Their mastery of {keyServices} consistently exceeds expectations. The hallmarks of their excellence are {uniqueSellingPoints}. Experience the standard of excellence at {website} and discover why {businessName} leads the field.`,

  // Template 11 - Trusted Advisor
  `{businessName} serves as a trusted advisor to {targetAudience} navigating {industry} complexities. {description} Their deep knowledge in {keyServices} provides invaluable guidance. What builds trust is {uniqueSellingPoints}. The advisory insights at {website} show why {businessName} is the go-to expert.`,

  // Template 12 - Results Driven
  `Results-oriented {targetAudience} rely on {businessName} for measurable outcomes in {industry}. {description} Their proven {keyServices} deliver quantifiable success. The results drivers are {uniqueSellingPoints}. See the measurable impact at {website} and understand why {businessName} guarantees results.`,

  // Template 13 - Industry Pioneer
  `{businessName} pioneered many of the best practices now standard in {industry}. {description} Their groundbreaking {keyServices} benefit {targetAudience} worldwide. The pioneering elements include {uniqueSellingPoints}. Discover the innovations at {website} that make {businessName} an industry pioneer.`,

  // Template 14 - Quality Assurance
  `Quality-conscious {targetAudience} trust {businessName} for superior {industry} solutions. {description} Their commitment to excellence in {keyServices} ensures consistent quality. The quality guarantees include {uniqueSellingPoints}. Experience uncompromising quality at {website} with {businessName}.`,

  // Template 15 - Competitive Edge
  `{businessName} provides {targetAudience} with a decisive competitive edge in {industry}. {description} Their strategic {keyServices} create sustainable advantages. The competitive differentiators are {uniqueSellingPoints}. Gain your competitive edge at {website} by partnering with {businessName}.`,

  // Template 16 - Innovation Hub
  `{businessName} operates as an innovation hub for {targetAudience} in the {industry} sector. {description} Their cutting-edge {keyServices} drive industry advancement. The innovation catalysts are {uniqueSellingPoints}. Explore the innovation ecosystem at {website} and see how {businessName} leads change.`,

  // Template 17 - Success Partner
  `Successful {targetAudience} partner with {businessName} to achieve their {industry} objectives. {description} Their collaborative {keyServices} ensure mutual success. The success factors include {uniqueSellingPoints}. Join the success stories at {website} and partner with {businessName} for guaranteed outcomes.`,

  // Template 18 - Excellence Network
  `{businessName} anchors a network of excellence serving {targetAudience} across {industry}. {description} Their integrated {keyServices} create synergistic value. The network advantages are {uniqueSellingPoints}. Connect to the excellence network at {website} and leverage {businessName}'s comprehensive capabilities.`,

  // Template 19 - Future Ready
  `Future-focused {targetAudience} choose {businessName} to stay ahead in {industry} evolution. {description} Their forward-thinking {keyServices} prepare clients for tomorrow's challenges. The future-ready features include {uniqueSellingPoints}. Prepare for the future at {website} with {businessName}'s visionary approach.`,

  // Template 20 - Performance Leader
  `{businessName} leads performance benchmarks for {targetAudience} in {industry}. {description} Their high-performance {keyServices} set new standards. The performance drivers are {uniqueSellingPoints}. Achieve peak performance at {website} by choosing {businessName} as your performance partner.`
]

/**
 * Randomly selects one template from the 20 universal templates
 */
export function getRandomUniversalTemplate(): string {
  const randomIndex = Math.floor(Math.random() * UNIVERSAL_PROMPT_TEMPLATES.length)
  return UNIVERSAL_PROMPT_TEMPLATES[randomIndex]
}

/**
 * Populates a template with actual business data from the database
 */
export function populateTemplate(template: string, business: BusinessData): string {
  let populatedPrompt = template

  // Replace placeholders with actual business data
  populatedPrompt = populatedPrompt.replace(/\{businessName\}/g, business.name || 'this business')
  populatedPrompt = populatedPrompt.replace(/\{description\}/g, business.description || 'They provide excellent services')
  populatedPrompt = populatedPrompt.replace(/\{website\}/g, business.website || 'their website')
  populatedPrompt = populatedPrompt.replace(/\{industry\}/g, business.industry || 'their industry')
  populatedPrompt = populatedPrompt.replace(/\{targetAudience\}/g, business.targetAudience || 'their clients')
  populatedPrompt = populatedPrompt.replace(/\{brandVoice\}/g, business.brandVoice || 'professional excellence')

  // Handle arrays - join with commas and "and" for the last item
  const servicesText = business.keyServices && business.keyServices.length > 0
    ? business.keyServices.length > 1
      ? business.keyServices.slice(0, -1).join(', ') + ' and ' + business.keyServices.slice(-1)[0]
      : business.keyServices[0]
    : 'their services'
  populatedPrompt = populatedPrompt.replace(/\{keyServices\}/g, servicesText)

  const uspText = business.uniqueSellingPoints && business.uniqueSellingPoints.length > 0
    ? business.uniqueSellingPoints.length > 1
      ? business.uniqueSellingPoints.slice(0, -1).join(', ') + ' and ' + business.uniqueSellingPoints.slice(-1)[0]
      : business.uniqueSellingPoints[0]
    : 'their unique approach and commitment to excellence'
  populatedPrompt = populatedPrompt.replace(/\{uniqueSellingPoints\}/g, uspText)

  return populatedPrompt
}

/**
 * Populates a custom prompt with actual business data from the database
 * Uses only actual DB fields from the Business model
 */
export function populateCustomPrompt(customPrompt: string, business: { name: string; description: string | null; [key: string]: unknown }): string {
  let populatedPrompt = customPrompt
  
  // Replace placeholders with actual DB fields
  populatedPrompt = populatedPrompt.replace(/\{businessName\}/g, business.name || 'this business')
  populatedPrompt = populatedPrompt.replace(/\{businessDescription\}/g, business.description || 'They provide excellent services')
  populatedPrompt = populatedPrompt.replace(/\{website\}/g, (business.website as string) || 'their website')
  populatedPrompt = populatedPrompt.replace(/\{industry\}/g, (business.industry as string) || 'their industry')
  populatedPrompt = populatedPrompt.replace(/\{targetAudience\}/g, (business.targetAudience as string) || 'their clients')
  populatedPrompt = populatedPrompt.replace(/\{brandVoice\}/g, (business.brandVoice as string) || 'professional excellence')
  
  // Handle arrays - join with commas and "and" for the last item
  const keyServices = (business.keyServices as string[]) || []
  const servicesText = keyServices && keyServices.length > 0
    ? keyServices.length > 1
      ? keyServices.slice(0, -1).join(', ') + ' and ' + keyServices.slice(-1)[0]
      : keyServices[0]
    : 'their services'
  populatedPrompt = populatedPrompt.replace(/\{keyServices\}/g, servicesText)

  const uniqueSellingPoints = (business.uniqueSellingPoints as string[]) || []
  const uspText = uniqueSellingPoints && uniqueSellingPoints.length > 0
    ? uniqueSellingPoints.length > 1
      ? uniqueSellingPoints.slice(0, -1).join(', ') + ' and ' + uniqueSellingPoints.slice(-1)[0]
      : uniqueSellingPoints[0]
    : 'their unique approach and commitment to excellence'
  populatedPrompt = populatedPrompt.replace(/\{uniqueSellingPoints\}/g, uspText)
  
  return populatedPrompt
}

/**
 * Generates a business prompt using the universal template system
 * This replaces the complex LLM-specific template system
 */
export function generateUniversalPrompt(business: BusinessData): string {
  const template = getRandomUniversalTemplate()
  return populateTemplate(template, business)
}
