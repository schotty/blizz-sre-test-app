import React, { useState, useEffect } from 'react';
import './App.css';
import { forwardRef } from 'react';
import _ from 'lodash';
import MaterialTable from "material-table";
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import axios from 'axios'


//Material Table icon settings
const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

//base url for the axios get requests
const api = axios.create({
    baseURL: `https://us.api.blizzard.com/hearthstone/`
})

//This is here in place of the secret store like Vault or something
const API_KEY = process.env.REACT_APP_API_KEY  

function App() {

    //running into a issue where its trying to call the names of the types/rarities/sets/classes
    //before they're set. 
    // solved it by adding the check prior to the name so if it does fail, it doesn't mem leak. 

    var columns = [
        //hidden ID collum to set the default sorting of the page
        { title: "ID", field: "id", defaultSort: 'asc', hidden: true },
        { title: "Image", field: "image", render: rowData => <img src={rowData.image} style={{ width: 100 }} />, sorting: false },
        { title: "Name", field: "name" },
        { title: "Type", field: "cardTypeId", render: rowData => types[rowData.cardTypeId]?.name },
        { title: "Rarity", field: "rarityId", render: rowData => rarities[rowData.rarityId]?.name },
        { title: "Set", field: "cardSetId", render: rowData => sets[rowData.cardSetId]?.name, sorting: false  },
        { title: "Class", field: "classId", render: rowData => classes[rowData.classId]?.name }
    ]

    //Sets the table data from the api call. 
    const [data, setData] = useState([]); //table data

    //This could have been stored here but I have it calling
    //the api so that it would be more flexible
    const [meta, setMeta] = useState({}); //meta data

    //for error handling
    const [iserror, setIserror] = useState(false);
    const [errorMessages, setErrorMessages] = useState([]);

    //Make the data easier to handle
    //also you only have to iterate through it once
    //then you can just call by the id
    const types = _.keyBy(meta.types, 'id');
    const rarities = _.keyBy(meta.rarities, 'id');
    const sets = _.keyBy(meta.sets, 'id');
    const classes = _.keyBy(meta.classes, 'id');


    //useEffect to do the GET requests for the metadata. getting it each time so 
    //its more fleixble if this data is changing in the future. If its pretty static
    //we could keep it in the app. Ideally we just have a database or something to
    //get the data from so it can be more targeted.
    //I did a single get on the metadata so that the number of requests are lower
    //it ends up with extra data that might not be used but the request isn't too
    //crazy and makes the app more flexible going forward so that other devs
    //can request data without having to add extra api calls. 
    useEffect(() => {
        api.get("metadata?locale=en_US&access_token=" + API_KEY)
            .then(res => {
                setMeta(res.data)
            })
            .catch(error => {
                setErrorMessages(["Cannot load meta data"])
                setIserror(true)
                console.log(errorMessages);
            })
        api.get("cards?locale=en_US&class=warlock%2Cdruid&manaCost=7%2C8%2C9%2C10&rarity=legendary&pageSize=10&access_token=" + API_KEY)
            .then(res => {
                setData(res.data.cards)
            })
            .catch(error => {
                setErrorMessages(["Cannot load card data"])
                setIserror(true)
                console.log(errorMessages);
            })
    }, [])

    //Returns a material-table element. Its pretty quick and easy
    //but not as flexible, but since this is just a quick demo app,
    //it will do for now
    return (<MaterialTable
        title="Legendary 7+ Mana Druid and Warlock Cards Of Awesomeness"
        columns={columns}
        data={data}
        icons={tableIcons}
        localization={{
            toolbar: {
                searchPlaceholder: 'Search A Card Name'
            }
        }}
        options={{
            sorting: true,
            pageSize: 10

        }}
    />
  );
}

export default App;
