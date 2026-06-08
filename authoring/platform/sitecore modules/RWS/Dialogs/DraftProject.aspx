<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="DraftProject.aspx.cs" Inherits="RWS.Sitecore.Tms.Connector.sitecore_modules.RWS.Dialogs.DraftProject" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>

    <style>
        :root,
        body,
        form {
            height: 97%;
        }

        .site-header {
            background-color: #ffffff;
            height: 40px;
        }

            .site-header img {
                width: 80px;
                padding-left: 15px;
            }


        .draft .btn-danger {
            font-size: 12px;
            margin-left: 10px;
        }

        main {
            position: relative;
        }

        .listbox {
            min-width: 100px;
            float: left;
        }

        .moveItem {
            float: left;
        }

        .fontFromSitecore {
            font-family: "Open Sans", Arial, sans-serif;
            font-size: 13px;
            font-weight: 400;
        }

        .scButtonPrimary,
        input[type="submit"].scButtonPrimary {
            background-repeat: repeat-x;
            border-color: #207da2;
            -webkit-box-shadow: inset 0 1px #5dbadf;
            box-shadow: inset 0 1px #5dbadf;
            color: #fff;
            background-color: #207da2;
            background-image: linear-gradient(to bottom, #289bc8 0%, #207da2 100%);
            -moz-border-radius: 6px;
            -webkit-border-radius: 6px;
            border-radius: 6px;
        }

            .scButtonPrimary:hover,
            input[type="submit"].scButtonPrimary:hover {
                background-repeat: repeat-x;
                border-color: #175973;
                background-color: #1d7395;
                background-position: 0 0;
                background-image: linear-gradient(to bottom, #289bc8 0%, #289bc8 100%);
            }

            .scButtonPrimary:active,
            input[type="submit"].scButtonPrimary:active {
                background-color: #1d7395;
                background-image: -webkit-linear-gradient(top, #207da2 0%, #207da2 100%);
                background-image: -o-linear-gradient(top, #207da2 0%, #207da2 100%);
                background-image: linear-gradient(to bottom, #207da2 0%, #207da2 100%);
                background-repeat: repeat-x;
                -webkit-box-shadow: inset 0 3px 3px #13485e;
                box-shadow: inset 0 3px 3px #13485e;
                background-image: none;
                border-color: #175973;
            }

        .scButton,
        .btn-general {
            display: inline-block;
            margin-bottom: 0;
            font-weight: normal;
            text-align: center;
            vertical-align: middle;
            cursor: pointer;
            border: 1px solid #bdbdbd;
            white-space: nowrap;
            padding: 8px 12px;
            font-size: 12px;
            line-height: 1.42857143;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            min-width: 80px;
            height: 36px;
            text-shadow: none;
            margin-left: 10px;
            background-repeat: repeat-x;
            -webkit-box-shadow: inset 0 1px #ffffff;
            box-shadow: inset 0 1px #ffffff;
            text-shadow: none;
            background-color: #d9d9d9;
            background-image: linear-gradient(to bottom, #f0f0f0 0%, #d9d9d9 100%);
            -moz-border-radius: 6px;
            -webkit-border-radius: 6px;
            border-radius: 6px;
        }

            .scButton:hover,
            input[type="submit"]:hover {
                background-repeat: repeat-x;
                border-color: #bdbdbd;
                background-color: #d1d1d1;
                background-position: 0 0;
                background-image: linear-gradient(to bottom, #f0f0f0 0%, #f0f0f0 100%);
            }


        .scWizardButtons {
            position: fixed;
            width: 100%;
            bottom: 0;
            height: 56px;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            padding: 8px 15px 9px;
            text-align: right;
            background: #f0f0f0;
            white-space: nowrap;
            line-height: 34px;
            border-top: 1px solid #e3e3e3;
        }

        ul.nav-tabs li.active {
            background-color: #474747;
        }

        a.nav-link {
            color: #5e5e5e;
        }

        li:not(.active) a.nav-link:hover {
            color: #5e5e5e;
            background-color: #e3e3e3;
        }

        li.active a.nav-link {
            color: white;
        }

        .noMargin {
            margin: 0px;
        }


        .content {
            padding: 20px 20px 60px;
        }

        .theme--a {
            background-color: rgba(0, 0, 0, 0.05);
            border: 1px solid rgb(222, 226, 230);
        }

        .details {
            padding: 10px 20px;
        }

        .details__row {
            display: flex;
            flex-wrap: wrap;
            padding: 10px 0;
        }

        .details__term {
            margin-right: 10px;
        }

        .tab-pane {
            padding: 20px 0;
        }

        .drafts {
            padding: 0;
        }

        .draft {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 10px 10px;
            margin-bottom: 10px;
        }

        #draftProjectContent .tab-pane {
            padding: 0;
        }

        .selector-area {
            text-align: center;
        }

        .selector-ddl {
            font-size: 14px;
            padding: 4px;
            min-width: 280px;
        }

        .selector-row {
            display: block;
            padding: 5px 0;
            margin-bottom: 10px;
        }

        .btn-general {
            box-shadow: unset;
            margin: 10px 0 0 15px;
        }

        /* Absolute Center Spinner */
        .loading {
            position: fixed;
            z-index: 999;
            height: 2em;
            width: 2em;
            overflow: visible;
            margin: auto;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
        }

            /* Transparent Overlay */
            .loading:before {
                content: '';
                display: block;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.3);
            }

            /* :not(:required) hides these rules from IE9 and below */
            .loading:not(:required) {
                /* hide "loading..." text */
                font: 0/0 a;
                color: transparent;
                text-shadow: none;
                background-color: transparent;
                border: 0;
            }

                .loading:not(:required):after {
                    content: '';
                    display: block;
                    font-size: 10px;
                    width: 1em;
                    height: 1em;
                    margin-top: -0.5em;
                    -webkit-animation: spinner 1500ms infinite linear;
                    -moz-animation: spinner 1500ms infinite linear;
                    -ms-animation: spinner 1500ms infinite linear;
                    -o-animation: spinner 1500ms infinite linear;
                    animation: spinner 1500ms infinite linear;
                    border-radius: 0.5em;
                    -webkit-box-shadow: rgba(0, 0, 0, 0.75) 1.5em 0 0 0, rgba(0, 0, 0, 0.75) 1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) 0 1.5em 0 0, rgba(0, 0, 0, 0.75) -1.1em 1.1em 0 0, rgba(0, 0, 0, 0.5) -1.5em 0 0 0, rgba(0, 0, 0, 0.5) -1.1em -1.1em 0 0, rgba(0, 0, 0, 0.75) 0 -1.5em 0 0, rgba(0, 0, 0, 0.75) 1.1em -1.1em 0 0;
                    box-shadow: rgba(0, 0, 0, 0.75) 1.5em 0 0 0, rgba(0, 0, 0, 0.75) 1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) 0 1.5em 0 0, rgba(0, 0, 0, 0.75) -1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) -1.5em 0 0 0, rgba(0, 0, 0, 0.75) -1.1em -1.1em 0 0, rgba(0, 0, 0, 0.75) 0 -1.5em 0 0, rgba(0, 0, 0, 0.75) 1.1em -1.1em 0 0;
                }

        /* Animation */

        @-webkit-keyframes spinner {
            0% {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
            }

            100% {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
            }
        }

        @-moz-keyframes spinner {
            0% {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
            }

            100% {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
            }
        }

        @-o-keyframes spinner {
            0% {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
            }

            100% {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
            }
        }

        @keyframes spinner {
            0% {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
            }

            100% {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
            }
        }
    </style>
    <script defer src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.js"></script>
    <script defer src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.css">
</head>
<body class="fontFromSitecore">

    <!-- HEADER -->
    <header class="site-header row no-gutters align-items-center">
        <img src="/sitecore modules/RWS/images/Trados_logo-rgb.png" class="scRibbonToolbarLargeButtonIcon">
    </header>

    <!-- MAIN -->
    <main role="main">
        <form runat="server" id="form1">
            <asp:ScriptManager ID="ScriptManager1" runat="server">
            </asp:ScriptManager>

            <div runat="server" id="spinner" class="loading"></div>

            <section runat="server" id="draftProjectSelect" class="content">
                <div class="selector-area">
                    <header class="content_header selector-row">
                        <asp:Literal runat="server" ID="lblSelectDraftProjectText" />
                    </header>
                    <div class="selector-row">
                        <asp:DropDownList ID="ddlDraftProjectSelector" runat="server" OnSelectedIndexChanged="ddlDraftProjectSelector_SelectedIndexChanged" AutoPostBack="true" CssClass="selector-ddl"></asp:DropDownList>
                    </div>
                    <div class="selector-row">
                        <asp:Button ID="btnSelectDraftProject" runat="server" Text="Select" OnClick="btnSelectDraftProject_Click" class="btn-general btn-loader active" />
                    </div>
                </div>
            </section>

            <!-- CONTENT: Start -->
            <section runat="server" id="draftProjectContent">

                <ul class="nav nav-tabs" id="myTab" role="tablist">
                    <li class="nav-item active">
                        <a class="nav-link" id="projectDetailsTab-tab" data-toggle="tab" href="#projectDetailsTab" role="tab"
                            aria-controls="projectDetailsTab" aria-selected="true">
                            <label runat="server" class="noMargin" id="projectDetailsTabText"></label>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="projectItemsTab-tab" data-toggle="tab" href="#projectItemsTab" role="tab"
                            aria-controls="projectItemsTab" aria-selected="false">
                            <label runat="server" class="noMargin" id="projectItemsTabText"></label>
                        </a>
                    </li>
                </ul>

                <div class="tab-content" id="myTabContent">
                    <div class="tab-pane fade show active" id="projectDetailsTab" role="tabpanel"
                        aria-labelledby="projectDetailsTab-tab">
                        <div class="content">
                            <header class="content__header">
                                <h6>Project Details</h6>
                                <p>Details about the selected project:</p>
                            </header>
                            <div class="content__main">
                                <dl class="details theme--a">
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblScProjectName" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:Literal runat="server" ID="lbl_ProjectName" />
                                        </dd>
                                    </div>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblCreatedBy" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:Literal runat="server" ID="lbl_CreatedBy" />
                                        </dd>
                                    </div>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lbl_SourceLanguage" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:Literal runat="server" ID="lbl_targetLanguages" />
                                        </dd>
                                    </div>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblScTargetLanguages" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:Literal runat="server" ID="lblTargetLang" />
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div class="tab-pane fade show" id="projectItemsTab" role="tabpanel" aria-labelledby="projectItemsTab-tab">
                        <div class="content">
                            <header class="content__header">
                                <h6>Project Items</h6>
                                <p>
                                    <asp:Literal runat="server" ID="lblSubtitle"></asp:Literal>
                                </p>
                            </header>
                            <div class="content__main">

                                <ul runat="server" id="dv_DraftProject" class="row no-gutters">
                                    <asp:UpdatePanel runat="server">
                                        <ContentTemplate>
                                            <asp:Repeater runat="server" ID="rptProjectItems" ItemType="System.String" OnItemDataBound="rptProjectItems_ItemDataBound">
                                                <ItemTemplate>
                                                    <li class="draft theme--a" id="up">
                                                        <%-- ReSharper disable once RedundantCast --%>
                                                        <span><%# ((RepeaterItem)Container).DataItem.ToString() %></span>
                                                        <%-- ReSharper disable once RedundantCast --%>
                                                        <asp:Button runat="server" ID="btnRemove" class="btn btn-danger btn-sm" title="Remove Item" Visible="false"
                                                            EnableViewState="true" CommandArgument='<%# ((RepeaterItem)Container).DataItem.ToString() %>'
                                                            OnClientClick="return confirm('Are you sure to remove this item from the project?');" OnClick="btnRemove_Click"></asp:Button>
                                                    </li>
                                                </ItemTemplate>
                                            </asp:Repeater>
                                        </ContentTemplate>
                                    </asp:UpdatePanel>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="scWizardButtons">
                    <asp:Button runat="server" ID="btnInitiate" name="btnInitiate"
                        OnClick="btnInitiate_Click" CssClass="scButton scButtonPrimary btn-loader" />
                    <asp:Button runat="server" ID="btnDrop" name="btnDrop"
                        OnClientClick="return confirm('Are you sure to delete this draft project?');" OnClick="btnDrop_Click" CssClass="scButton" />
                    <asp:Button runat="server" ID="btnCancelProj" name="btnCancelProj"
                        OnClick="btnCancel_Click" CssClass="scButton" />
                </div>
            </section>

            <div runat="server" id="confirmationScreen" visible="false">
                <div id="dv_DraftSuccess" visible="false" runat="server" class="row no-gutters rowSpacer align-items-center">
                    <span>
                        <asp:Label ID="lblSCInitiatedSuccessMessage" runat="server" /></span>
                </div>
                <div id="dv_DraftDropMessage" visible="false" runat="server" class="row no-gutters rowSpacer align-items-center">
                    <span>
                        <asp:Label ID="lblScDropSuccessMessage" runat="server" /></span>
                </div>

                <div class="scWizardButtons">
                    <asp:Button runat="server" ID="btnCancel" OnClick="btnCancel_Click" CssClass="scButton scButtonPrimary btn-loader" />
                </div>
            </div>
            <!-- CONTENT: End -->

        </form>
    </main>
    <script type="text/javascript">
        function AddButtonEvents() {
            $('.btn-loader').click(function () {
                $('#spinner').show();
            });
        }

        document.addEventListener('DOMContentLoaded', function () {
            AddButtonEvents();
        }, false);
    </script>
</body>
</html>
