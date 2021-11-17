import React from 'react'
import Pagination from 'react-bootstrap/Pagination'

export default function DependencyPaginationButtons({
  onClick,
  page,
  pageSize
}) {
  const BarSize = 5;
  // 불변의 렌더링된 모든 버튼들
  const inActivated = React.useMemo(() => {
    const buttons = [];
    for(let i=0; i<pageSize; i++) {
      buttons[i] = (
        <Pagination.Item
          key={`inActivated:${i}`}
          onClick={e => onClick(i)}
        >
          {i+1}
        </Pagination.Item>
      );
    }
    return buttons;
  }, [
    pageSize, onClick
  ]);
  const Activated = React.useMemo(() => {
    const buttons = [];
    for(let i=0; i<pageSize; i++) {
      buttons[i] = (
        <Pagination.Item
          active
          key={`Activated:${i}`}
          onClick={e => onClick(i)}
        >
          {i+1}
        </Pagination.Item>
      );
    }
    return buttons;
  }, [
    pageSize, onClick
  ]);
  // pageSize가 없다면 버튼을 그리지 않습니다.
  if(pageSize === null) {
    return null;
  }
  // 버튼 목록 그리기
  const pageLevel = Math.floor(page * (1 / BarSize));
  const pagination = [];
  let i = pageLevel * BarSize;
  while(i < (pageLevel * BarSize) + BarSize && i < pageSize) {
    pagination[i] = (page === i) ? Activated[i] : inActivated[i];
    i++;
  }
  return (
    <Pagination>
      {i-BarSize>0 &&
        <Pagination.Prev
          onClick={e => onClick(i - BarSize - 1)}
        />
      }
      {pagination}
      {i<pageSize &&
        <Pagination.Next
          onClick={e => onClick(i)}
        />
      }
    </Pagination>
  );
}
