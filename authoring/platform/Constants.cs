using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Intralox.Platform
{
    public class Constants
    {
        public struct SiteSettings
        {
            public static readonly string AllowedLanguages = "{BD149FF9-154A-462C-BD8A-C51D277B83CB}";
            public static readonly string SiteTheme = "{168C7542-744E-4CE8-B994-2C34FDEB6F35}";
            public static readonly string SiteThemeValueField = "{F0E430C7-247B-4B0A-96B0-5457BEC3B244}";
            public static readonly string LanguageSource = "{DD7860FD-440A-4D99-9EED-4F3D5E116EBB}";
        }

        public struct LinkGrid
        {
            public const string ServiceListing = "{6053EC1E-13AB-46CE-BE54-E79B372A6CBA}";
            public const string IndustryListing = "{C2F3815D-E90F-4AAE-BB76-282B4425553A}";
            public const string SubIndustryListing = "{9A1A33F3-7DA5-4E3E-A094-431BDB324DB3}";
            public const string ProductGroups = "{31C3A153-19C5-4D40-A57D-0E41834F5210}";


            public struct Fields
            {
                public static readonly string Eyebrow = "{515C60D9-F8D5-46E7-9C3E-B1A02BCE525D}";
                public static readonly string Headline = "{1B9FD551-7CCE-48A5-BEE4-A58331240BF5}";
                public static readonly string Description = "{CE6A0E80-BB59-4BCB-9B61-D83DD4E0D6E1}";
                public static readonly string LinkType = "{39D4DEFD-590D-4768-80AD-81E840E8297A}";
                public static readonly string ItemCount = "{1903ED1C-5F64-4F7A-90E6-33DEEF2571AE}";
            }
        }

        public struct FeaturedNews
        {
            public const string Insights = "{F3BB3D8A-4A51-4399-9C2B-4B5A63196111}";
            public const string News = "{4947C5FC-0C07-4B6C-9CDE-DCC571A4BD32}";
            public const string Spotlight = "{9B02098A-B00B-47B7-B158-6CDAC8BE63E5}";

            public struct Fields
            {
                public static readonly string Eyebrow = "{1272DE2B-2536-4128-AB0A-C29B64F9FFC2}";
                public static readonly string Headline = "{CBFADF10-1A3E-4DE8-A06C-239F223411B7}";
                public static readonly string Description = "{99AEF366-3792-489F-AA8C-53940114735E}";
                public static readonly string ArticleType = "{254AF8B4-97D7-401D-A0C6-3841D800C3E7}";
                public static readonly string ItemCount = "{69B4D0EB-7DC3-4EE0-A4EC-7E049F494893}";
                public static readonly string ViewAllLink = "{45A35A04-7B27-49DF-852D-3BFEDE8ED610}";
                public static readonly string Industries = "{459B1CA1-AC59-4372-AE8A-F70D3BB5CAAB}";
                public static readonly string Solutions = "{F7DDC8D3-2A74-4C74-83C3-89AE02FFF4F5}";
                public static readonly string Products = "{04CE9DCF-D9C3-49A7-9E60-D9DCEA9A7DE8}";

                public static readonly string StoryTopics = "{F5EFE21B-F09B-43B9-B2FF-1DA8BF2592C1}";
                public static readonly string CustomerConcerns = "{6F446BC7-9459-4CA0-887E-805D8F0312B8}";
                public static readonly string ServiceCategories = "{AF0615AC-899E-4E09-AE1F-0B0D1F109F5F}";
                public static readonly string Regions = "{BEE60097-158A-4DB5-AB2E-13A61728C6FC}";
                public static readonly string Authors = "{4B09E781-29D9-4DB8-8C5A-C6AB7EFE1046}";

                public static readonly string Pinned = "{79FC77D0-467B-4A16-A069-85118D9BDDE6}";
                public static readonly string ShowWebsiteSpecific = "{CFCFC7DD-5718-4DBB-951D-2ECD722006C6}";
            }
        }

        public struct ArticleType
        {
            public struct Fields
            {
                public static readonly string Title = "{7EC79C2C-96A1-4B21-B014-A4EE2A0548B5}";
                public static readonly string SubHeadline = "{BC7B04E6-7B80-4E84-BA31-1909A4F2BE49}";
                public static readonly string Summary = "{4546C9FC-DF02-482D-A13D-DD79E46ED1D6}";
                public static readonly string Description = "{D029A79D-B972-49FE-B2A4-81E33196358E}";
                public static readonly string ArticleType = "{B7E126C9-6C1E-4658-9D52-D393151A942C}";
                public static readonly string Author = "{24AE65CF-AE34-40A3-9342-E22FEA52AB39}";
                public static readonly string PostDate = "{4FD425B9-62C6-45BC-AC45-EDED259F8398}";
                public static readonly string HideDate = "{0E6C16D1-68F9-4453-862D-0FDCAA003848}";
                public static readonly string ShowBreadcrumb = "{E4D951AE-1B92-4F5A-8B50-AF537DACFA3F}";
                public static readonly string HideFromHomePage = "{3A645A43-73DD-45A5-89E5-7C8065B17A62}";
                public static readonly string Image = "{46DE15B4-FA27-4CF0-9975-1EAC4C828799}";
                public static readonly string Video = "{D35A9F84-FD3E-47BE-8D27-EC6829739856}";

                public static readonly string Pinned = "{189688BE-31BF-41CD-8810-FB0CA69997E0}";
                public static readonly string ShowOnWebsite = "{3F8718F7-AF74-4C1D-81CB-C8CB3E441E97}";
                public static readonly string ShowOnPortal = "{00C026F9-B518-425A-9A6A-943CF42B3BE7}";


                public static readonly string Industries = "{459B1CA1-AC59-4372-AE8A-F70D3BB5CAAB}";
                public static readonly string Solutions = "{F7DDC8D3-2A74-4C74-83C3-89AE02FFF4F5}";
                public static readonly string Products = "{04CE9DCF-D9C3-49A7-9E60-D9DCEA9A7DE8}";

                public static readonly string StoryTopics = "{F5EFE21B-F09B-43B9-B2FF-1DA8BF2592C1}";
                public static readonly string CustomerConcerns = "{6F446BC7-9459-4CA0-887E-805D8F0312B8}";
                public static readonly string ServiceCategories = "{AF0615AC-899E-4E09-AE1F-0B0D1F109F5F}";
                public static readonly string Regions = "{BEE60097-158A-4DB5-AB2E-13A61728C6FC}";


            }
        }

        public struct RelatedCaseStudies
        {
            public struct Fields
            {
                public static readonly string Eyebrow = "{4758EF48-7119-4115-9EDF-14A2819725B5}";
                public static readonly string Headline = "{D0EFC828-F6C0-4EC5-B97B-68768D9BB9D9}";
                public static readonly string Description = "{C5E5DB17-B3EC-4079-9522-6AD63410AAAE}";
                public static readonly string ItemCount = "{78915E08-B1EF-4C59-819B-38913F30067A}";
                public static readonly string ShowFeatured = "{2BC1AA7A-CE3A-44DE-95AD-2C8A9A4D6D32}";
                public static readonly string Industries = "{459B1CA1-AC59-4372-AE8A-F70D3BB5CAAB}";
                public static readonly string Solutions = "{F7DDC8D3-2A74-4C74-83C3-89AE02FFF4F5}";
                public static readonly string Products = "{04CE9DCF-D9C3-49A7-9E60-D9DCEA9A7DE8}";
                public static readonly string ManualCaseStudies = "{8ACAB2AE-FE39-4AAE-A3F2-F7282DCA7A1A}";
                public static readonly string ShowCompany = "{E39EF43C-EBEC-4C33-9CC7-45671C4E42A7}";
            }
        }

        public struct CaseStudy
        {
            public struct Fields
            {
                public static readonly string Company = "{CF5C9F33-2583-433D-976C-2599BC31C23E}";
                public static readonly string Headline = "{F3FF86B1-8CB7-4D73-99D9-DCA1A1E7A3EB}";
                public static readonly string Summary = "{E0A184E6-1296-49F2-BE2C-9EC404E0CF25}";
                public static readonly string Description = "{40011844-DC45-4A81-A8A3-B644316E13A4}";
                public static readonly string PostDate = "{C8F19766-13EE-409B-8D64-BFB60F2861D4}";
                public static readonly string HideDate = "{4191DEC9-EFC5-4BD1-ADEC-73B974683059}";
                public static readonly string ShowBreadcrumb = "{E5E08C28-C8A5-439E-8566-0D1919C0BD2C}";
                public static readonly string IsFeatured = "{5AFB04A0-9F07-4FA9-A17D-16EDC49FD3B8}";
                public static readonly string Image = "{4682E56E-18E5-4940-BA0C-F77E898664AC}";
                public static readonly string Video = "{21D34BE5-FF46-431A-B2B0-7B35DF741F0E}";

                public static readonly string Industries = "{459B1CA1-AC59-4372-AE8A-F70D3BB5CAAB}";
                public static readonly string Solutions = "{F7DDC8D3-2A74-4C74-83C3-89AE02FFF4F5}";
                public static readonly string Products = "{04CE9DCF-D9C3-49A7-9E60-D9DCEA9A7DE8}";
            }
        }

        public struct ActiveEvent
        {
            public struct Fields
            {
                public static readonly string StartDate = "{091991B7-BC39-44FB-88B1-F1D97B296571}";
                public static readonly string EndDate = "{85D880E5-23BE-4635-B36A-4747F48EF327}";
                public static readonly string SelectedEvent = "{ED3F0B29-8323-4E93-9779-C48412E2D6AE}";
            }
        }

        public struct Event
        {
            public struct Fields
            {
                public static readonly string EventName = "{ED5063DF-9F19-4B95-88CC-EC4048C6BBA6}";
                public static readonly string Region = "{EBA8346D-9AB3-485E-A668-10AE75AC4357}";
                public static readonly string Location = "{F4F9D5CE-4941-44AA-837A-803F7513F8F8}";
                public static readonly string StartDate = "{58F97378-6149-4676-9F69-2B4240B311A5}";
                public static readonly string EndDate = "{98F50DAE-1F14-4CB0-B8EB-A07CA42AAE6E}";
                public static readonly string EventUrl = "{E82A0C98-1FEB-4C0F-B1FF-E8B5EC16F8F1}";
            }
        }

        public struct Author
        {
            public struct Fields
            {
                public static readonly string Name = "{6EA7C9D6-FFDA-4975-93D4-FA5E4B3E2337}";
                public static readonly string Bio = "{1DF17DC7-C396-41BA-9495-10CC1BED11B1}";
                public static readonly string Image = "{82495529-1CC6-48E3-8DD8-B474F95B00E6}";
            }
        }

        public struct Company
        {
            public struct Fields
            {
                public static readonly string Name = "{B83BA612-0EB2-46A1-95DD-44BB344C7D1C}";
                public static readonly string Link = "{980DF26B-66EC-4733-A245-613583725513}";
                public static readonly string Logo = "{2994A6E0-8B46-421D-B4B1-ABFED6D7DE50}";
            }
        }

        public struct VideoItem
        {
            public struct Fields
            {
                public static readonly string Title = "{5C97F7C9-5590-413D-8274-D1F693893A7C}";
                public static readonly string Caption = "{88F5E443-41E8-4BBF-8008-D74330636645}";
                public static readonly string CoverImage = "{5B6A8B56-E9F0-4510-A0DA-AC17877332A6}";
                public static readonly string BrightcoveId = "{3C6EB40E-DD34-4095-8262-53A0822D7275}";
                public static readonly string Autoplay = "{569238B3-EBE5-4C72-BC97-F48095F5168C}";
                public static readonly string Loop = "{4764D158-4C2C-4014-A4F4-1C8108B02A23}";
            }
        }

        public struct BeltComponent
        {
            public struct Fields
            {
                public static readonly string Title = "{E187F2D8-D258-4F52-8D8A-439088839A8F}";
                public static readonly string Images = "{7E594A73-2F63-4115-B754-6DAB01E60483}";
                public static readonly string Component = "{EC19CAD8-1052-42E7-A202-BA20E2644EFF}";
            }
        }

        public struct BeltTool
        {
            public struct Fields
            {
                public static readonly string Title = "{449EAE80-1440-482F-B5F6-B9C683DAB211}";
                public static readonly string Images = "{3E4DF513-1403-4516-AA66-9BA1D711F48E}";
            }
        }

        public struct BeltImage
        {
            public struct Fields
            {
                public static readonly string Image = "{344E9726-01AF-4B45-9C72-4B325E55501B}";
            }
        }

        public struct BeltFileData
        {
            public static readonly string BeltFileDataFolder = "{51D67369-52EE-47C8-9C40-6D35944AF416}";

            public static readonly string TemplateId = "{9747F9F4-67D0-481B-A3B9-9D5F7C4B3C96}";

            public struct Fields
            {
                public static readonly string BeltSeries = "{2F873844-AD6B-4840-B288-00966C046D9D}";
                public static readonly string BeltProduct = "{5EFB79A6-0AF2-4B21-8AE9-9CEEB5F25C8D}";
                public static readonly string BeltComponentProduct = "{E2685F48-65FF-4CE0-A9DB-C58C02677FDD}";
                public static readonly string BeltToolProduct = "{806216F4-335F-4DDB-BBC4-AE8FA4D189D2}";


                public static readonly string Title = "{57B62399-193C-4EC4-B09F-E9ECFA13B76B}";
                public static readonly string File  = "{CFF997E1-7706-4B96-9715-6A9BE3C409F0}";
                public static readonly string FileType = "{B24CCC24-9A68-4FD7-AF8F-41BDD1CF421E}";
            }
        }

        public struct TagItem
        {
            public struct Fields
            {
                public static readonly string Value = "{F0E430C7-247B-4B0A-96B0-5457BEC3B244}";
            }
        }

        public struct BeltSeries
        {
            public struct Fields
            {
                public static readonly string Title = "{1157FEFD-1B64-485F-B782-FF07388EB65A}";
                public static readonly string SeriesNumber = "{012DD134-0C23-4EF6-B8C0-801A32C6F7A3}";
            }
        }

        public struct PageTypes
        {
            public static readonly string Solution = "{B7DA43A0-932C-4BBB-BC41-639AB3F397D4}";
            public static readonly string Industry = "{CD3D31C0-A217-48F4-8680-75178DC0D35B}";
            public static readonly string SubIndustry = "{D43AF2C7-8BEF-41E0-862D-67FFEE6FB3EC}";
            public static readonly string ProductGroup = "{4E6B1115-DE45-429F-837A-22473C42B450}";
            public static readonly string ArticleType = "{4D1B0DA6-B2FA-4F06-9001-36995ACD7E23}";
            public static readonly string EventType = "{90FD055D-55D5-4EED-8C21-09613C25AEE4}";
            public static readonly string CaseStudy = "{3ADFB01B-06CB-4DDF-815F-479554F6202F}";
            public static readonly string ItemCount = "{1903ED1C-5F64-4F7A-90E6-33DEEF2571AE}";


            public static readonly string BeltSeries = "{41379A3E-DF8D-4C9B-9DD6-15B0DD92D509}";
            public static readonly string BeltPage = "{4CE9073B-CA79-42B4-AAB7-9CC77B63BBFC}";
            public static readonly string BeltComponent = "{E7A8BCF0-7675-44AF-A31B-46814F0E0364}";
            public static readonly string BeltTool = "{4B6F486F-582A-4DA6-A771-F771EF97456A}";


            public static readonly string AccessoriesPage = "{1F3248BD-0E88-418D-858B-C3A60C3FF85A}";
            public static readonly string SprocketsPage = "{47879006-DD79-4C28-9C77-353A265F933F}";
            public static readonly string ToolsPage = "{8439BC75-6075-4CD7-A715-7C3E8CFD3B2F}";
        }
    }
}