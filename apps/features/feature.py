from functools import wraps

class UseFeature:
    def __init__(self, *proxy_classes):
        self._proxy_classes = proxy_classes

    def __call__(self, cls):
        # hook all important functions
        async_hooks = ('on_event', 'on_update', 'prepare')
        def create_wrapper(f):
            @wraps(f)
            async def wrapper(s, *args, **kwargs):
                for proxy in s._proxy_instances:
                    await getattr(proxy, f.__name__)(*args, **kwargs)
                return await f(s, *args, **kwargs)
            return wrapper

        for hook in async_hooks:
            orig = getattr(cls, hook)
            setattr(cls, hook, create_wrapper(orig))

        orig_init = getattr(cls, '__init__')
        @wraps(orig_init)
        def init_hook(s, *args, **kwargs):
            s._proxy_instances = [c(s, *args, **kwargs) for c in self._proxy_classes]
            return orig_init(s, *args, **kwargs)
        setattr(cls, '__init__', init_hook)

        orig_getattribute = getattr(cls, '__getattribute__')
        @wraps(orig_getattribute)
        def getattribute_hook(s, k):
            if k == '_proxy_instances':
                return object.__getattribute__(s, k)

            try:
                return orig_getattribute(s, k)
            except AttributeError:
                for proxy in s._proxy_instances:
                    if hasattr(proxy, k):
                        return getattr(proxy, k)
                raise

        setattr(cls, '__getattribute__', getattribute_hook)

        return cls
