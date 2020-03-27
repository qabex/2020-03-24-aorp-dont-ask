const delay = (( ms=1000 ) =>(
  new Promise(y =>
    setTimeout(y, ms) ) ) );

async function * as_async_iter(ao_iterable) {
  yield * ao_iterable;}


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
  ao_iter = as_async_iter(ao_iter);

  const aod = ao_deferred (async ( ao ) => {
    for await (const tip of ao_iter) {
      ao.update(tip);
      aod.reset();} });

  return {
    inner: ao_iter
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

async function ao_watch(...args) {
  let obj={}, ao_iter, on_update;
  for (const ea of args) {
    if ('function' === typeof ea) {
      on_update = ea;}
    else if (undefined !== ea[Symbol.asyncIterator] || ea.next) {
      ao_iter = as_async_iter(ea);}
    else obj = ea;}

  return _ao_watcher(obj, ao_iter, on_update) }


async function _ao_watcher(obj, ao_iter, on_update) {
  const {value, done} = await ao_iter.next();
  obj.value = value;
  obj.done = done;
  obj.tail = done
    ? Promise.resolve(obj)
    : _ao_watcher(obj, ao_iter, on_update);

  if (undefined !== on_update) {
    await on_update(value, obj); }

  return obj}

function as_ao_watch(arg) {
  if (undefined !== arg.tail) {
    return arg }// already an ao_watch instance

  arg = as_async_iter(arg);
  return _ao_watcher({}, arg)}

function _ao_watch_inner(_ao_compute_with) {
  return (( fn_compute, on_update ) => {
    const ao = _ao_compute_with(fn_compute);
    return _ao_watcher({}, ao, on_update) }) }

function ao_watch_compute_kw(by_kw) {
  return _ao_watch_inner(
    ao_compute_entries(
      Object.entries(by_kw)) ) }

function ao_compute_entries(by_entries) {
  const watch_deps = new Map();
  for (const [name, each] of by_entries) {
    watch_deps.set(name, as_ao_watch(each)); }

  return _ao_compute_with.bind(null,
    watch_deps, _ao_compute_kw) }




async function ao_watch_join(watch_deps) {
  await new Promise (( resolve ) => {
    for (const d of watch_deps.values()) {
      d.tail.then(resolve);} }); }

async function * _ao_compute_with(watch_deps, _ao_compute, fn_compute, only_next) {
  if (only_next) {
    await ao_watch_join(watch_deps); }

  while (true) {
    yield _ao_compute(watch_deps, fn_compute);
    await ao_watch_join(watch_deps); } }

function _ao_compute_kw(watch_deps, fn_compute) {
  const deps = {};
  for (const [k,d] of watch_deps.entries()) {
    deps[k] = d.value;}
  return fn_compute(deps)}

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

function ao_dom_events(...args) {
  return ao_tee(ao_dom_updates(...args)) }

function ao_dom_updates(elem, evt_list='input', fn_compute='value') {
   {
    if ('string' === typeof elem) {
      elem = document.querySelector(elem);}

    if ('string' === typeof evt_list) {
      evt_list = evt_list.split(/\s+/);}

    if ('string' === typeof fn_compute) {
      const attr = fn_compute;
      fn_compute = elem => elem[attr];} }


  return ao_updates ((async function * ( ao ) {
    function _update() {
      ao.update(elem); }

    for (const evt of evt_list) {
      elem.addEventListener(evt, _update); }

    try {
      _update(elem);
      yield fn_compute;}

    finally {
      for (const evt of evt_list) {
        elem.removeEventListener(evt, _update); } } }).bind(this)) }

const ao_bango = ao_dom_events('#bango', 'input', elem => + elem.value);
const ao_bingo = ao_dom_events('#bingo', 'input', elem => + elem.value);
const ao_bongo = ao_dom_events('#bongo', 'input', elem => + elem.value);

async function trial_a() {
  let ao_fn;

  {
    const bango = await ao_watch(ao_bango, v => console.log({bango: v}));
    const bingo = await ao_watch(ao_bingo, v => console.log({bingo: v}));
    const bongo = await ao_watch(ao_bongo, v => console.log({bongo: v}));

    ao_fn = ao_watch_compute_kw({
      bango
    , bingo
    , bongo}); }

  const ao_v = await ao_fn(awesome);

  while (true) {
    console.log(ao_v);
    await delay(1000);} }


async function awesome({bango, bingo, bongo}) {
  const color = `rgb(${[bango, bingo, bongo]})`;
  const e_div = document.querySelector('#output');
  e_div.style.backgroundColor = color;
  return color}

Promise.resolve().then(trial_a);
//# sourceMappingURL=index.mjs.map
