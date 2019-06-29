import { ImmutableObject, ImmutableArray } from 'seamless-immutable';

/* Root reducer's state slice type. */
export type ExampleState = ImmutableObject<{
    // Description of data member.
    data: number;
}>;

/* Description of type. */
export type ExampleType = string;