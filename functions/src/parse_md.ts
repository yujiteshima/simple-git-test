import { load } from 'js-yaml'

type EmptyObject  = Record<string, never>

interface FindMetaIndices {
  (mem: number[], item: string, i: number): number[]
}
// 「---」の行と「---」の行の行のインデックスを配列に詰める
const findMetaIndices: FindMetaIndices = (mem, item, i) => {
  if (/^---/.test(item)) {
    mem.push(i)
  }
  return mem
}
// type
interface ParseMeta {
  ({ lines, metaIndices }: {
    lines: string[],
    metaIndices: number[],
  }): EmptyObject | unknown
}

const emptyObject = {}

// メタデータだけjs-yamlでパース
const parseMeta: ParseMeta = ({ lines, metaIndices }) => {
  if (metaIndices.length > 0) {
    const metadata = lines.slice(metaIndices[0] + 1, metaIndices[1])
    return load(metadata.join('\n'))
  }
  return emptyObject
}
// type
interface ParseContent {
  ({ lines, metaIndices }: {
    lines:        string[],
    metaIndices:  number[],
  }): string
}

const parseContent: ParseContent = ({ lines, metaIndices }) => {
  if (metaIndices.length > 0) {
    lines = lines.slice(metaIndices[1] + 1, lines.length)
  }
  return lines.join('\n')
}
// TODO: interfaceを定義する
const parseMD = (contents: any): any => {
  const lines: string[]       = contents.split('\n')
  const metaIndices: number[] = lines.reduce(findMetaIndices, [])
  const metadata    = parseMeta({ lines, metaIndices })
  const content: string     = parseContent({ lines, metaIndices })

  return { metadata, content }
}

export default parseMD