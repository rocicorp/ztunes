import {Zero, ZeroOptions, Schema, CustomMutatorDefs} from '@rocicorp/zero';
import {ZeroProvider as ZeroProviderImpl} from '@rocicorp/zero/react';
import {useEffect, useState} from 'react';

export type ZeroProviderProps<
  S extends Schema,
  M extends CustomMutatorDefs<S> = {},
> = ZeroOptions<S, M> & {
  children: React.ReactNode;
  inspect?: boolean;
  init?: (zero: Zero<S, M>) => void;
};

export function ZeroProvider<
  S extends Schema,
  M extends CustomMutatorDefs<S> = {},
>(props: ZeroProviderProps<S, M>) {
  const {children, inspect, init, ...opts} = props;
  const zero = useZero(opts, init);
  if (zero) {
    console.timeStamp('got zero');
  }
  useExposeZero(zero, inspect ?? false);

  if (!zero) {
    return null;
  }

  return <ZeroProviderImpl zero={zero}>{children}</ZeroProviderImpl>;
}

function useZero<S extends Schema, MD extends CustomMutatorDefs<S>>(
  opts: ZeroOptions<S, MD>,
  init?: (zero: Zero<S, MD>) => void,
) {
  const [zero, setZero] = useState<Zero<S, MD> | undefined>(undefined);

  useEffect(() => {
    const z = new Zero(opts);
    if (init) {
      init(z);
    }

    setZero(z);

    return () => {
      zero?.close();
      setZero(undefined);
    };
  }, [init, ...Object.values(opts)]);

  return zero;
}

function useExposeZero<S extends Schema, MD extends CustomMutatorDefs<S>>(
  zero: Zero<S, MD> | undefined,
  inspect: boolean,
) {
  useEffect(() => {
    let canceled = false;

    if (!zero || !inspect) {
      return;
    }

    (window as any).__zero = zero;
    zero.inspect().then(inspector => {
      if (!canceled) {
        (window as any).__inspector = inspector;
      }
    });

    return () => {
      (window as any).__zero = undefined;
      (window as any).__inspector = undefined;
      canceled = true;
    };
  }, [zero]);
}
