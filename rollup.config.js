import rpi_jsy from 'rollup-plugin-jsy-lite'
import rpi_resolve from '@rollup/plugin-node-resolve'

const configs = []
export default configs

const sourcemap = true
const external = []
const plugins = [
  rpi_resolve(),
  rpi_jsy(),
]

add_jsy('index')


function add_jsy(src_name, module_name) {
  if (!module_name) module_name = src_name

  configs.push({
    input: `code/${src_name}.jsy`,
    output: { file: `esm/${src_name}.mjs`, format: 'es', sourcemap },
    plugins, external })
}

