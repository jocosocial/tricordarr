import {LayoutRectangle} from 'react-native';
import {useReducer} from 'react';

export enum ListLayoutActions {
  append = 'append',
}

export type ListLayoutActionsType = {type: ListLayoutActions.append; item: LayoutRectangle};

const listLayoutReducer = (items: LayoutRectangle[], action: ListLayoutActionsType) => {
  switch (action.type) {
    case ListLayoutActions.append: {
      return [...items, action.item];
    }
  }
};

export const useListLayoutReducer = (initialState: LayoutRectangle[] = []) =>
  useReducer(listLayoutReducer, initialState);
