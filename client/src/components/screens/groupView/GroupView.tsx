import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useParams } from "react-router";
import { Filters } from "src/types/Group";
import GroupMembersList from "../../GroupMembersList/GroupMembersList";
import TagFilters from "../findRestaurants/TagFilters";
import PricePointsFilter from "../findRestaurants/PriceFilter";
import { AllRestaurants } from "../findRestaurants/restaurants/allRestaurants";
import "./GroupView.css";
import { ExtendedGroupData, Group } from "../../../../../server/models/Group";
import { Restaurant } from "src/types/Resturants";
import JoinGroupDialog from "../../JoinGroupDialog/JoinGroupDialog";
import { useNavigate, useLocation } from "react-router-dom";
import GroupMenu from "../../GroupMenu/GroupMenu";
import CollapsableMap from "src/components/Map/CollapsableMap";
import WeekDayFilter from "../findRestaurants/WeekDayFilter";

const io = require("socket.io-client");
let socket;

const GroupView: React.FC = (): JSX.Element => {
  const { id } = useParams();
  const [group, setGroup] = useState<Group>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    []
  );
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const curUser = sessionStorage.getItem("user_email");
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { group: Group };


  const handleApprove = () => {
    const curUser = sessionStorage.getItem("user_email");
    socket.emit("addNewUser", { user: curUser, groupId: id });
    setIsDialogOpen(false);
  };

  const handleCancellation = () => {
    setIsDialogOpen(false);
    navigate("/", { replace: true });
  };

  const handleLeaveGroup = () => {
    socket.emit("leaveGroup", { user: curUser, groupId: id });
    navigate("/");
  };

  function initWebsocket() {
    socket = io();
    socket.emit("joinGroup", { user: curUser, groupId: id });
    socket.on("newUser", (data) => {
      if (sessionStorage.getItem("user_email") === data) {
        setIsDialogOpen(true);
      }
    });
    socket.on("groupDataChanged", (data: ExtendedGroupData) => {
      console.log("received groupDataChanged");
      const { restaurants, ...groupData } = data;
      setGroup(groupData);
      if (restaurants) {
        setRestaurants(restaurants);
      }
    });

    return socket;
  }

  const handleFiltersChange = (newFilters: Filters) => {
    const updatedGroup = { ...group, filters: newFilters } as Group;
    setGroup(updatedGroup);
    socket.emit("filtersUpdate", updatedGroup);
  };

  const handleFilteredRestaurantsChnage = (newFilteredRestaurants) => {
    setFilteredRestaurants(newFilteredRestaurants);
  };

  useEffect(() => {
    const socket = initWebsocket();
    return () => socket.disconnect();
  }, []);
    const handleWeekDayFilterChange = (newDay: string, newTime: string): void => {
        handleFiltersChange({...group.filters, day: newDay, hour: newTime});
    }

  if (!socket || !group)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ height: "100%", width: "100%" }}
      >
        <CircularProgress size={60} />
      </Box>
    );

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      {group && (
        <JoinGroupDialog
          isOpen={isDialogOpen}
          onApprove={handleApprove}
          onCancellation={handleCancellation}
          group={group}
        ></JoinGroupDialog>
      )}
      <Box sx={{display:'flex', flexDirection: 'column', width: '100%'}}>

        <Box sx={{ borderBottom: '1px solid #c1c1c13d', backgroundColor: '#f8f8f8' }}>
          <Box sx={{ height: 88,display: 'flex', alignItems: 'center', maxWidth: 'calc(100vw - 70px)', padding: '24px', paddingRight: '30px'  }}>
              <Box sx={{marginRight: 'auto'}}>
                  <Typography variant="h5" >{state ? state.group.name : group.name}</Typography>
              </Box>
              <WeekDayFilter 
                initialDay={group.filters.day}
                initialTime={group.filters.hour}
                onValueChange={handleWeekDayFilterChange}
            />
            <PricePointsFilter
              filters={group.filters}
              onFiltersChange={handleFiltersChange}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", overflow: "auto", width: "100%", height:'100%' }}>
          <Box sx={{ minWidth:300, width: 300, borderRight: '1px solid #c1c1c13d', padding: '8px', overflow:'auto', backgroundColor: '#f8f8f8'}}>
            <div style={{ display: "flex" }}>
              <GroupMenu onLeaveGroup={handleLeaveGroup}></GroupMenu>
              <Button
                variant="outlined"
                size="medium"
                color="inherit"
                endIcon={<ContentCopyIcon />}
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
                className="CopyToClipboardButton"
              >
                {window.location.href}
                <span className="ContentCopyIcon">
                  <ContentCopyIcon style={{ backgroundColor: "white" }} />
                </span>
              </Button>
            </div>
            <GroupMembersList group={group}></GroupMembersList>
            <div>
              {group && (
                <TagFilters
                  filters={group?.filters}
                  selectedTags={group.filters.tags}
                  onFiltersChange={handleFiltersChange}
                />
              )}
            </div>
          </Box>
                  <Box sx={{ overflow: 'auto', width: '100%'}}>

                  <AllRestaurants
                    restaurants={restaurants}
                    filters={group?.filters}
                    selectedRestaurant={selectedRestaurant}
                    filteredRestaurants={filteredRestaurants}
                    onFilteredRestaurantsChange={
                      handleFilteredRestaurantsChnage
                    }
                    onRestaurantClick={(restaurant) =>
                      setSelectedRestaurant(restaurant)
                    }
                    pagination={true}
                  />
                  </Box>
        </Box>
      </Box>
      <CollapsableMap
        filters={group?.filters}
        onFiltersChange={handleFiltersChange}
        selectedRestaurant={selectedRestaurant}
        restaurants={filteredRestaurants}
      />
    </Box>
  );
};

export default GroupView;
