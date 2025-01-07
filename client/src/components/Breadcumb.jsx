import React, { useEffect, useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";

const ROUTE_CONFIGS = {
  admin: {
    root: "/admin",
    defaultLabel: "Dashboard",
    routes: {
      profile: {
        label: "Profile",
      },
      links: {
        label: "Links",
      },
      stats: {
        label: "Stats",
      },
      users: {
        label: "Users",
      },
      domains: {
        label: "Domains",
      },
    },
  },
  user: {
    root: "/user",
    defaultLabel: "Dashboard",
    routes: {
      profile: {
        label: "Profile",
      },
      links: {
        label: "Links",
        dynamic: {
          ":linkId": {
            label: "Link Details",
            dataFetcher: async (id) => {
              try {
                // TODO: fetch link info
                return `Link ${id}`;
              } catch (e) {
                return "Link Details";
              }
            },
            children: {
              stat: { label: "Statistics" },
              edit: { label: "Edit" },
              "stat-list": { label: "Statistics List" },
            },
          },
        },
      },
      stats: {
        label: "Statistics List",
      },
    },
  },
};

const Breadcrumb = () => {
  const location = useLocation();
  const params = useParams();
  const [dynamicData, setDynamicData] = useState({});

  // Memoize layout type and config to prevent unnecessary recalculations
  const { layoutType, config } = useMemo(
    () => ({
      layoutType: location.pathname.startsWith("/admin") ? "admin" : "user",
      config: location.pathname.startsWith("/admin")
        ? ROUTE_CONFIGS.admin
        : ROUTE_CONFIGS.user,
    }),
    [location.pathname]
  );

  // Memoize pathnames to prevent unnecessary array operations
  const pathnames = useMemo(
    () =>
      location.pathname
        .replace(config.root, "")
        .split("/")
        .filter((x) => x),
    [location.pathname, config.root]
  );

  // Keep track of which dynamic data we're currently fetching
  const [fetchingId, setFetchingId] = useState(null);

  useEffect(() => {
    const fetchDynamicData = async () => {
      const segments = pathnames;
      const parentRoute = segments[0];
      const routeConfig = config.routes[parentRoute];

      if (!routeConfig?.dynamic) return;

      const dynamicSegments = Object.keys(routeConfig.dynamic);

      for (const segment of dynamicSegments) {
        const paramKey = segment.slice(1);
        const paramValue = params[paramKey];

        if (
          paramValue &&
          !dynamicData[paramValue] &&
          fetchingId !== paramValue
        ) {
          setFetchingId(paramValue);
          try {
            const dataFetcher = routeConfig.dynamic[segment].dataFetcher;
            const label = await dataFetcher(paramValue);
            setDynamicData((prev) => ({
              ...prev,
              [paramValue]: label,
            }));
          } catch (error) {
            console.error("Error fetching dynamic data:", error);
          } finally {
            setFetchingId(null);
          }
        }
      }
    };

    fetchDynamicData();
  }, [params, config, pathnames, dynamicData, fetchingId]);

  const getLabel = (path, index, segments) => {
    // Check if this is a dynamic parameter
    const paramName = Object.keys(params).find(
      (param) => params[param] === path
    );

    if (paramName) {
      // Only show loading for the specific item being fetched
      if (fetchingId === path) return "Loading...";
      return dynamicData[path] || "Details";
    }

    // Check if this is a child route of a dynamic segment
    const parentRoute = segments[0];
    const routeConfig = config.routes[parentRoute];

    if (routeConfig?.dynamic) {
      const dynamicConfig = Object.values(routeConfig.dynamic)[0];
      if (dynamicConfig?.children?.[path]) {
        return dynamicConfig.children[path].label;
      }
    }

    // Check in main route config
    const mainRouteConfig = config.routes[path];
    if (mainRouteConfig) {
      return mainRouteConfig.label;
    }

    // Default case
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const breadcrumbItems = pathnames.map((path, index) => {
    if (pathnames.length === 0) return null;

    const label = getLabel(path, index, pathnames);
    const routeTo = `${config.root}/${pathnames.slice(0, index + 1).join("/")}`;
    const isLast = index === pathnames.length - 1;

    return (
      <React.Fragment key={path}>
        <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
        <div className="flex items-center">
          {isLast ? (
            <span className="text-gray-600 font-medium">{label}</span>
          ) : (
            <Link
              to={routeTo}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {label}
            </Link>
          )}
        </div>
      </React.Fragment>
    );
  });

  return (
    <div className="flex items-center text-sm py-2">
      <Link
        to={config.root}
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        {config.defaultLabel}
      </Link>
      {breadcrumbItems}
    </div>
  );
};

export default Breadcrumb;
