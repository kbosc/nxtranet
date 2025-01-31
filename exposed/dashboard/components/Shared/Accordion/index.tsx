import React, {useEffect, useRef, useState} from 'react';
import * as Style from './style';

interface IAccordionProps {
  isVisible?: boolean;
  title: string | React.ReactChildren | React.ReactElement;
  content: string | React.ReactChildren | React.ReactElement;
  onClick?: () => void;
}

function usePrevious<T>(value: T): T {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current as T;
}

export default function Accordion(props: IAccordionProps) {
  const {isVisible} = props;
  const [isVisibleState, setIsVisibleState] = useState(props.isVisible || false);
  const prev = usePrevious({isVisible: isVisible || false}) || {};
  useEffect(() => {
    if (prev.isVisible !== isVisible) {
      setIsVisibleState(isVisible || false);
    }
  }, [isVisible]);

  function showAccordion() {
    setIsVisibleState(!isVisibleState);
    if (props.onClick) props.onClick();
  }

  return (
    <Style.Container>
      <Style.TitleContainer onClick={showAccordion}>
        {props.title}
      </Style.TitleContainer>
      <Style.ContentContainer
        isVisible={isVisibleState}
      >
        {props.content}
      </Style.ContentContainer>
    </Style.Container>
  )
}
