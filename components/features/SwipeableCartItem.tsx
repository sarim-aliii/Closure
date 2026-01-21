import React from 'react';
import {
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import Trash from '../icons/Trash';

interface SwipeableCartItemProps {
  item: any;
  children: React.ReactNode;
  onDelete: (id: string) => void;
}

const SwipeableCartItem: React.FC<SwipeableCartItemProps> = ({ item, children, onDelete }) => {
  
  const handleDeleteAction = async () => {
    // 1. Vibrate for feedback
    await Haptics.impact({ style: ImpactStyle.Medium });
    // 2. Perform delete
    onDelete(item.id);
  };

  const trailingActions = () => (
    <TrailingActions>
      <SwipeAction
        destructive={true}
        onClick={handleDeleteAction}
      >
        <div className="flex items-center justify-center bg-red-600 text-white w-full h-full px-6">
          <Trash className="w-6 h-6" />
          <span className="ml-2 font-semibold">Delete</span>
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  return (
    <SwipeableListItem
      trailingActions={trailingActions()}
      threshold={0.25}
      className="transition-transform"
    >
      {/* Container ensures the card styling isn't messed up by the wrapper */}
      <div className="w-full bg-white dark:bg-gray-800"> 
        {children}
      </div>
    </SwipeableListItem>
  );
};

export default SwipeableCartItem;