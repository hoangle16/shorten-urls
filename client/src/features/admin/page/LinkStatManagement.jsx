import dayjs from "dayjs";
import DataManagement from "../../../components/DataManagement";
import {
  useLinkStatList,
  useDeleteStat,
  useDeleteStats,
} from "../../stats/hooks/useLinkStat";
import { useParams } from "react-router-dom";
import { Button } from "../../../components/Button";

const LinkStatManagement = () => {
  const { linkId } = useParams();
  const columns = [
    {
      key: "browser",
      title: "Browser",
    },
    {
      key: "country",
      title: "Country",
    },
    {
      key: "os",
      title: "Platform",
    },
    {
      key: "referrer",
      title: "Referrer",
    },
    {
      key: "createdAt",
      title: "Clicked Date",
      sortable: true,
      render: (value) => <div>{dayjs(value).format("YYYY-MM-DD HH:mm")}</div>,
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, row, { onDelete }) => (
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row._id);
          }}
        >
          Delete
        </Button>
      ),
    },
  ];

  const filterOptions = [
    {
      key: "browser",
      placeholder: "Select a browser",
      options: [
        { value: "Chrome", label: "Chrome" },
        { value: "Edge", label: "Edge" },
        { value: "Firefox", label: "Firefox" },
        { value: "Brave", label: "Brave" },
        { value: "Opera", label: "Opera" },
        { value: "Safari", label: "Safari" },
      ],
    },
    {
      key: "country",
      placeholder: "Select a country",
      options: [
        { value: "VN", label: "Vietnam" },
        { value: "US", label: "United States" },
        { value: "UK", label: "United Kingdom" },
        { value: "DE", label: "Germany" },
        { value: "FR", label: "France" },
        { value: "ES", label: "Spain" },
        { value: "IT", label: "Italy" },
        { value: "CH", label: "Switzerland" },
        { value: "JP", label: "Japan" },
        { value: "SG", label: "Singapore" },
        { value: "KR", label: "Korea" },
        { value: "TW", label: "Taiwan" },
        { value: "CN", label: "China" },
        { value: "CA", label: "Canada" },
        { value: "AU", label: "Australia" },
        { value: "NZ", label: "New Zealand" },
        { value: "IN", label: "India" },
        { value: "MY", label: "Malaysia" },
        { value: "TH", label: "Thailand" },
        { value: "ID", label: "Indonesia" },
        { value: "PH", label: "Philippines" },
      ],
    },
    {
      key: "os",
      placeholder: "Select a platform",
      options: [
        { value: "Windows", label: "Windows" },
        { value: "Linux", label: "Linux" },
        { value: "Android", label: "Android" },
        { value: "Apple", label: "Apple" },
      ],
    },
  ];
  return (
    <DataManagement
      title={`Stats for Link ID: ${linkId}`}
      pageTitle={`Stats for Link ID: ${linkId} | Shorten URLs`}
      columns={columns}
      useDataQuery={useLinkStatList}
      useDeleteMutation={useDeleteStat}
      useDeleteManyMutation={useDeleteStats}
      filterOptions={filterOptions}
      dataPath="stats"
      paginationPath="pagination"
      additionalFilters={{ linkId }}
      hasSearchInput={false}
    />
  );
};

export default LinkStatManagement;
