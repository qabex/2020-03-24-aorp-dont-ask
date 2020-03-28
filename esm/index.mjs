const delay = (( ms=1000 ) =>(
  new Promise(y =>
    setTimeout(y, ms) ) ) );

async function * as_ao_iter(ao_iterable) {
  if (undefined !== ao_iterable.tail) {
    ao_iterable = ao_tail_obj(ao_iterable);}

  yield * ao_iterable;}

async function * ao_tail_obj(ao_obj) {
  if (undefined === ao_obj) {ao_obj = this;}

  while (ao_obj && true !== ao_obj.done) {
    yield ao_obj.value;
    ao_obj = await ao_obj.tail;} }

function is_ao_iterable(v) {
  if (undefined !== v[Symbol.asyncIterator] || v.next || v.tail) {
    return true}
  return false}


const deferred = ((() => {
  const l=[], lset = l.splice.bind(l, 0, 2);
  return function deferred(host) {
    if (undefined === host) {
      host = this || {reset: deferred};}

    host.promise = new Promise(lset);
    host.resolve = l[0];
    host.reject = l[1];
    return host} })());


function ao_deferred(init_ao) {
  const aod = deferred({
    tip: undefined
  , valid: false
  , done: false
  , reset: deferred});

  aod.init = init_ao({
    // mirrored async generator protocol
    update(v) {
      aod.valid = true;
      aod.tip = v;
      aod.resolve(v);
      return aod.promise}

  , return(v) {
      aod.done = Promise.resolve(v);
      aod.resolve();
      return aod.done}

  , throw(err) {
      aod.done = Promise.reject(err);
      aod.resolve();
      return aod.done} });

  return aod}


function ao_tee(ao_iter, only_next_) {
  only_next_ = !! only_next_;
  ao_iter = as_ao_iter(ao_iter);

  const aod = ao_deferred (async ( ao ) => {
    for await (const tip of ao_iter) {
      ao.update(tip);
      aod.reset();} });

  return {
    ao_iter
  , ao_tee(only_next=only_next_) {
      return ao_tee_dispatch(aod, only_next)}
  , [Symbol.asyncIterator]() {
      return ao_tee_dispatch(aod, only_next_)} } }


async function * ao_tee_dispatch(aod, only_next) {
  if (!only_next && aod.valid) {
    yield aod.tip;}

  while (true) {
    await aod.promise;
    if (false !== aod.done) {
      return await aod.done}
    yield aod.tip;} }

const ao_watch_obj0 ={
  [Symbol.asyncIterator]: ao_tail_obj};

async function ao_watch(...args) {
  let ao_obj={__proto__: ao_watch_obj0}, ao_iter, on_update;
  for (const ea of args) {
    if ('function' === typeof ea) {
      on_update = ea;}
    else if (is_ao_iterable(ea)) {
      ao_iter = as_ao_iter(ea);}
    else ao_obj = ea;}

  return _ao_walker(ao_obj, ao_iter, on_update) }


async function _ao_walker(ao_obj, ao_iter, on_update) {
  const {value, done} = await ao_iter.next();
  ao_obj.value = value;
  ao_obj.done = done;
  ao_obj.tail = done ? Promise.resolve(ao_obj)
    : _ao_walker(ao_obj, ao_iter, on_update);

  if (undefined !== on_update) {
    ao_obj.value = await on_update(value, ao_obj); }

  return ao_obj}

async function as_ao_watch(arg) {
  arg = await arg;
  if (undefined !== arg && null !== arg) {
    if (undefined !== arg.tail) {
      return arg }// already an ao_watch instance

    if (is_ao_iterable(arg)) {
      return await _ao_walker(
        {__proto__: ao_watch_obj0}
      , as_ao_iter(arg)) } }

  return {value: arg, done: true} }

const _e_value = e => e.value;

function ao_track_updates_kw(kw) {
  kw = Object.entries(kw);
  return _ao_track_updates_kw(ao_deps_map(kw)) }

async function * _ao_track_updates_kw(watch_deps) {
  watch_deps = await watch_deps;

  while (true) {
     {
      const deps = {};
      for (const e of watch_deps.entries()) {
        deps[e[0]] = e[1].value;}

      yield deps;}

    await _ao_await_any_dep(watch_deps.values()); } }

async function ao_deps_map(by_entries) {
  const watch_deps = new Map();
  for (const [name, each] of by_entries) {
    watch_deps.set(name, await as_ao_watch(each)); }
  return watch_deps}



async function _ao_await_any_dep(iter_deps) {
  await new Promise (( resolve ) => {
    for (const {tail} of iter_deps) {
      if (undefined !== tail) {
        tail.then(resolve);} } }); }

function ao_track_kw(kw) {
  return ao_tee(ao_track_updates_kw(kw)) }

async function * ao_updates(init_ao) {
  const aod = ao_deferred(init_ao);
  for await (let xform of aod.init) {
    if ('function' !== typeof xform) {
      xform = undefined;}

    yield * ao_dispatch(aod, xform); } }


async function * ao_dispatch(aod, xform) {
  while (true) {
    await aod.promise;
    if (false !== aod.done) {
      return await aod.done}

    // grab current v_tip into local const
    let v_cur = aod.tip;
    aod.tip = undefined;
    aod.reset();

    if (undefined !== xform) {
      v_cur = await xform(v_cur); }

    yield v_cur;} }

const _en_click = ['click'];
const _en_input = ['input', 'change'];
const _e_no_default = e => e.preventDefault();
const _opt_unpack = ({text, value}) =>({text, value});
const _dom_std_args ={
  _:[_en_click]
, 'input':[_en_input, _e_value]
, 'output':[_en_input, _e_value]
, 'input,number':[_en_input, e => e.valueAsNumber]
, 'input,range':[_en_input, e => e.valueAsNumber]
, 'input,button':[_en_click, _e_value]
, 'input,submit':[_en_click, _e_value]
, 'input,checkbox':[_en_input, e => e.checked]
, 'input,radio':[_en_input, e => e.checked]
, 'input,date':[_en_input, e => e.valueAsDate]
, 'input,time':[_en_input, e => e.valueAsNumber]
, 'input,file':[_en_input, e => e.multiple ? e.files : e.files[0]]
, 'textarea':[_en_input, _e_value]
, 'select':{
      evt_names: _en_input
    , on_evt(e) {
        const res = Array.from(e.selectedOptions, _opt_unpack);
        return e.multiple ? res : res[0]} }

, 'form':{
      evt_names: _en_input
    , on_evt: e => new FormData(e)
    , on_add(e) {e.addEventListener('submit', _e_no_default);} } };


function _dom_builtin(std, elem) {
  let {tagName: tag, type} = elem;
  tag = tag.toLowerCase();

  const res =
    type && std[`${tag},${type.toLowerCase()}`]
    || std[tag] || std._;

  return Array.isArray(res)
    ?{elem, evt_names: res[0], on_evt: res[1]}
    :{elem, ... res} }


function _dom_unpack_args(std, elem, args) {
  if ('string' === typeof elem) {
    elem = document.querySelector(elem);}

  return args && args.length
    ?{elem, evt_names: args[0], on_evt: args[1]}
    : _dom_builtin(std, elem)}



const _dom_std_unpack_args = 
  _dom_unpack_args.bind(null, _dom_std_args);

function ao_dom_events(elem, ...args) {
  return ao_tee(_ao_dom_updates(
    _dom_std_unpack_args(elem, args)) ) }



function _ao_dom_updates({elem, evt_names, on_evt, on_calc, on_add, on_remove}) {
  if (!Array.isArray(evt_names)) {
    evt_names = (evt_names || 'click').split(/\s+/);}

  const extra = on_evt || {};
  if ('function' !== typeof on_evt) {
    on_evt = extra.on_evt;}

  return ao_updates ((async function * ( ao ) {
    const _update = on_evt
      ? evt => ao.update(on_evt(elem, evt))
      : ()=> ao.update(elem);

    if (extra.on_add) {
      extra.on_add(elem);}

    for (const e of evt_names) {
      elem.addEventListener(e, _update); }

    try {
      _update(elem);
      yield extra.on_calc;}

    finally {
      for (const e of evt_names) {
        elem.removeEventListener(e, _update); }

      if (extra.on_remove) {
        extra.on_remove(elem);} } }).bind(this)) }
//# sourceMappingURL=index.mjs.map

const dom_loaded = new Promise(resolve =>
  window.addEventListener('DOMContentLoaded', resolve) );

{(async ()=>{
  await dom_loaded;

  const ao_deps = ao_track_kw({
    red: ao_dom_events('#red')
  , green: ao_dom_events('#green')
  , blue: ao_dom_events('#blue') });

  const ao_color = await ao_watch(ao_deps,
    (({ red, green, blue }) =>
      `rgb(${[0|red, 0|green, 0|blue]})`) );

  const e_div = document.querySelector('#target');
  ao_watch(ao_color, color =>
    e_div.style.backgroundColor = color);

  {(async ()=>{
    while (true) {
      console.log('tick:', ao_color.value);
      await delay(1500);} })();} })();}
//# sourceMappingURL=index.mjs.map
