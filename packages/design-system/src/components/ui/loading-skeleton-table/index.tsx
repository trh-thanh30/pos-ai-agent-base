const SkeletonRow = ({ numColumns }: { numColumns: number }) => {
  return (
    <tr className="border-b border-b-gray-100 animate-pulse">
      {Array.from({ length: numColumns }).map((_, idx) => {
        // Vary the width based on column index to simulate real table data
        let widthClass = 'w-3/4';
        if (idx === 0) widthClass = 'w-6 mx-auto'; // STT column is centered and small
        else if (idx === 1) widthClass = 'w-20';
        else if (idx === 2) widthClass = 'w-48';
        else if (idx === 3) widthClass = 'w-16';
        else if (idx === 4) widthClass = 'w-24';
        else if (idx % 2 === 0) widthClass = 'w-14';
        else widthClass = 'w-32';

        return (
          <td key={idx} className="px-4 py-3.5">
            <div className={`h-4 bg-gray-100 rounded-sm ${widthClass}`}></div>
          </td>
        );
      })}
    </tr>
  );
};

export const TableSkeleton = ({
  numRows = 10,
  numColumns,
}: {
  numRows?: number;
  numColumns: number;
}) => {
  return (
    <>
      {Array.from({ length: numRows }).map((_, idx) => (
        <SkeletonRow key={idx} numColumns={numColumns} />
      ))}
    </>
  );
};
