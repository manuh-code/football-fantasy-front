vas a crear una vista llamada FantasyLeagueDetailView donde vas a llamar un nuevo componente llamado FantasyLeagueDetail 
cada uno va a estar ubicado en la carpeta fantasy tanto en view y en components



el componente va a invocar el endpoint showFantasyLeague ubicado en FantasyLeagueService
el cual vas a mostrar el detalle de la fantasy league basado en el response del api, 

aqui tienes un ejemplo del response


     "uuid": "9673d84a-29e3-4dae-9a51-b0c43d8cf08b",
        "current_football_season_uuid": "c31c3d2c-798d-4130-aa63-a772c8109f50",
        "name": "Cruickshank Inc",
        "participants_count": 8,
        "members_count": 1,
        "description": "et delectus quae",
        "is_private": true,
        "isMember": true,
        "password": "public",
        "image_path": "https://api.fantasymx.test/storage/fantasy/league/b3.jpg",
        "started_at": "2025-08-13 14:00:00",
        "isAdmin": true,
        "participants": [
            {
                "uuid": "b86ca398-98c2-4095-862c-380ea53a8776",
                "firstname": "Ignacio Manuel",
                "lastname": "Sanchez Neri",
                "fullname": "Ignacio Manuel Sanchez Neri",
                "phone": "5541234567",
                "email": "manuh0989@gmail.com",
                "avatar": "https://api.fantasymx.test/storage/avatar/1-XilcqShCpxiBBbChGJELLNnGlir3V2oNOMK6YlEd.jpeg",
                "fantasyTeams": []
            }
        ],
        "draft": {
            "uuid": "70b5dcf0-6ce4-4699-b75c-668b60bb4b2e",
            "draft_day": "2025-06-28 23:21:00",
            "pick_timer": 120,
            "status": {
                "uuid": "f5229377-d681-4c18-b8c8-c268c31c62cf",
                "name": "Not started",
                "value": "NOT_STARTED",
                "type": "draft_status"
            }
        }
    }


    el componente va a seguir los estandares de diseño del proyecto usando tailwind


    el uuid lo vas a obtener cuando le damos click en el boton View Details del componente UserFantasyLeagueComponent,

    el cual esta la const viewLeague que va a redireccionar a la vista FantasyLeagueDetailView y este le mandara el uuid a su componente