import { readFileSync, writeFileSync } from 'node:fs'

const text = readFileSync('review/practice-review.md', 'utf8').replace(/\r/g, '')
const gradeParts = text.split(/^## Grade /m).slice(1)
const warnings = []

function parseVariable(line) {
  const head = line.match(/^- \*\*(.+?)\*\* \(`([^`]+)`\) — ([\s\S]+)$/)
  if (!head) {
    warnings.push(line)
    return null
  }
  const match = head[3].match(/^(.*?)\. Usual level: (.*?)\. Levels 1–5: (.*?)\. ([\s\S]*)$/)
  if (!match) {
    warnings.push(line)
    return null
  }
  let tail = match[4]
  let when = ''
  const shown = tail.match(/^Shown (.+?)\. ([\s\S]*)$/)
  if (shown) {
    when = shown[1]
    tail = shown[2]
  }
  const endings = [
    ['The question uses this.', 'uses'],
    ['This only changes how large a random number can be.', 'scale'],
    ['The question never reads this.', 'unread'],
  ]
  let effect = 'uses'
  let hint = tail
  for (const [sentence, name] of endings) {
    if (tail.endsWith(sentence)) {
      effect = name
      hint = tail.slice(0, -sentence.length).trim()
      break
    }
  }
  const control = match[1]
  const kind = control.startsWith('choices:') ? 'choices' : control === 'switch' ? 'switch' : 'slider'
  return {
    label: head[1],
    id: head[2],
    control,
    kind,
    options: kind === 'choices' ? control.replace(/^choices:\s*/, '').split(', ') : [],
    usual: match[2],
    levels: match[3].split(' / '),
    when,
    hint,
    effect,
  }
}

function parsePractice(chunk) {
  const lines = chunk.split('\n')
  const title = lines[0].trim()
  let sample = ''
  let picture = ''
  let control = ''
  const variables = []
  for (const line of lines.slice(1)) {
    if (line.startsWith('Sample: ')) sample = line.slice('Sample: '.length)
    else if (line.startsWith('Picture: ')) {
      const meta = line.match(/^Picture: (.*?)\. Answer control: (.*?)\.$/)
      if (meta) {
        picture = meta[1]
        control = meta[2]
      } else warnings.push(line)
    } else if (line.startsWith('- **')) {
      const variable = parseVariable(line)
      if (variable) variables.push(variable)
    }
  }
  return { title, sample, picture, control, variables }
}

function parseSkill(chunk) {
  const lines = chunk.split('\n')
  const heading = lines[0]
  const splitAt = heading.indexOf(' — ')
  const code = heading.slice(0, splitAt)
  const title = heading.slice(splitAt + 3)
  const body = lines.slice(1).join('\n').trim()
  const parts = body.split(/^#### /m)
  return {
    code,
    title,
    blurb: parts[0].trim(),
    practices: parts.slice(1).map(parsePractice),
  }
}

const grades = gradeParts.map((chunk) => {
  const grade = Number(chunk.slice(0, chunk.indexOf('\n')).trim())
  const body = chunk.slice(chunk.indexOf('\n')).trim()
  const skills = body.split(/^### /m).filter(Boolean).map(parseSkill)
  return {
    id: `grade-${grade}`,
    grade,
    title: `Grade ${grade}`,
    kicker: `${skills.reduce((sum, skill) => sum + skill.practices.length, 0)} practices`,
    image: `shots/grade-${grade}.png`,
    skills,
  }
})

const data = { grades }
writeFileSync('review/view-data.js', `window.REVIEW = ${JSON.stringify(data)}\n`)
const counts = grades.map((grade) => `${grade.grade}:${grade.kicker}`)
console.log(counts.join('  '))
console.log('warnings', warnings.length)
if (warnings.length) console.log(warnings.slice(0, 8).join('\n'))
