module.exports = (function() {
  // Ready translated locale messages
  const messages = {
    fr: {
      ascending: 'Croissant',
      descending: 'Décroissant',
      create_a_folder: 'Créer un dossier',
      name: 'Nom',
      created_date: 'Date de création',
      start_date: 'Date de début',
      end_date: 'Date de fin',
      sent_date: 'Date d’envoi',
      for_the_placement_on_timeline: '(pour le placement sur la timeline)',
      type: 'Type',
      color: 'Couleur',
      keywords: 'Mot-clés',
      author: 'Auteur(s)',
      zoom: 'Zoom',
      download: 'Télécharger',
      caption: 'Légende',
      date: 'Date',
      'active_filter:': 'Filtre actif&nbsp;:',
      'medias_shown:': 'Médias affichés&nbsp;:',
      'file:': 'Fichier&nbsp;:',

      loading: 'chargement',
      open: 'Ouvrir',
      save: 'Enregistrer',
      save_and_close: 'Enregistrer + fermer',
      edit: 'Éditer',
      print: 'Imprimer',
      create: 'Créer',
      remove: 'Suppr.',
      password: 'Mot de passe',
      protected_by_pass: 'protégé par mot de passe',
      password_instructions:
        'Si existant, seul les utilisateurs possédant ce mot de passe pourront modifier ce dossier et accéder aux médias non publics.',

      sort_by: 'Organiser par',
      in_the_order: 'Dans l’ordre',
      public: 'Public',
      content: 'Contenu',

      'lang:': 'Changer la langue&nbsp;:',
      lang: 'Changer la langue',

      keyboard_shortcuts: 'Raccourcis clavier',
      keyboard_shortcuts_instructions:
        'Associez ici l’appui sur des touches du clavier (ou d’un boîtier do•doc) à la création de markers colorés à ce moment précis dans la timeline.',

      credits:
        'Un projet libre et open-source réalisé par l’<a href="https://latelier-des-chercheurs.fr" class="js--openInBrowser" target="_blank">Atelier des Chercheurs</a> avec et pour le <a href="https://www.studiotheatre.fr/" class="js--openInBrowser" target="_blank">Studio-Théâtre de Vitry-sur-Seine</a>.',

      toconnectwithanotherdevice:
        'Pour accéder aux Cahiers avec un autre appareil, connectez-vous au même réseau wifi puis entrez l’url suivante dans un navigateur web&nbsp;: ',
      toconnectwithanotherdevicetothisfolder:
        'Pour accéder à ce dossier avec un autre appareil, connectez vous au même réseau wifi puis entrez l’url suivante dans un navigateur web&nbsp;: ',
      sureToRemoveFolder: 'Êtes-vous sûr de vouloir supprimer ce dossier ?',
      sureToRemoveMedia: 'Êtes-vous sûr de vouloir supprimer ce média ?',
      sureToRemoveAuthor: 'Êtes-vous sûr de vouloir supprimer cet auteur ?',
      sureToCloseModal: 'Êtes-vous sûr de vouloir fermer cette fenêtre ?',

      create_a_folder: 'Créer un dossier',
      edit_the_media: 'Éditer le média',
      edit_folder: 'Éditer le dossier',

      capture_start: 'Début de la capture',
      capture_end: 'Fin de la capture',
      currently: 'Actuellement',

      more_information:
        'Pour plus d’information, consultez la <a href="https://latelier-des-chercheurs.fr/docs/manuel-les-cahiers-du-studio" class="js--openInBrowser" target="_blank">documentation</a> ou <a href="mailto:info@latelier-des-chercheurs.fr?subject=Les Cahiers du Studio" class="js--openInBrowser" target="_blank">contactez</a> les auteurs de ce logiciel.',
      no_media_in_folder: 'Aucun média dans ce dossier.',
      no_public_media_in_folder: 'Aucun média public dans ce dossier.',
      auto_scroll: 'défilement<br>automatique',
      scale: 'échelle&nbsp;:',
      scale_items: {
        second: 'sec',
        minute: 'min',
        hour: 'h',
        half_day: '½j',
        day: 'j'
      },
      contents_are_stored: 'Les contenus de ce dossier sont enregistrés dans ',
      folder_information: 'Informations du dossier',
      calendar: 'Calendrier',
      now: 'en ce moment',
      list: 'Liste',
      fullscreen: 'Plein écran',
      preview: 'Aperçu',
      filter: 'Filtre',

      export_folder: 'Exporter en format WEB',
      export: 'Exporter',
      only_public_medias: 'Seul les médias indiqués <em>publics</em>',
      import: 'Importer',
      import_all_files: 'Importer tous les fichiers',
      import_medias: 'Importer des médias',
      select_type_of_export:
        'Sélectionnez ici le type d’export. Il est possible d’exporter tous les médias d’une timeline ou uniquement ceux indiqués comme Public.',
      export_with_all_medias: 'Exporter avec tous les médias',
      export_only_public_medias: 'Exporter les médias publics uniquement',
      password_protect: 'Protéger l’accès par un mot de passe',
      allow_media_download: 'Permettre le téléchargement des médias originaux',

      'with_all_medias:': 'Avec tous les médias',
      'only_public_medias:': 'Seulement les médias publics',

      last_modified: 'Dernière modification',

      notifications: {
        file_was_sent: 'Le fichier a été envoyé.',
        file_upload_not_allowed:
          'Votre navigateur web ne prend pas en charge l’envoi de fichiers.',
        connection_active: 'La connexion au serveur est active.',
        connection_lost: 'La connexion au serveur a été perdue.',
        contents_wont_be_editable:
          'Les modifications et ajouts ne seront plus pris en compte.',
        connection_error: 'La connexion au serveur n’a pu se faire.',
        'wrong_password_for_folder:':
          'Le password n’est pas le bon pour le dossier&nbsp;:',
        'created_edited_media:':
          'Création ou édition d’un média pour le dossier&nbsp;:',
        author_name_exists:
          'Ce nom d’auteur existe déjà, utilisez-en un autre.',
        folder_name_exists:
          'Ce nom de dossier existe déjà, utilisez-en un autre.',
        folder_name_needs_alphanumeric_characters:
          'Les noms de dossier doivent contenir au moins un caractère alphanumérique.',
        'failed_to_get_folder:': 'Le dossier suivant n’a pas été trouvé:',
        folder_export_started: 'Préparation du fichier à exporter en cours…'
      }
    },
    en: {
      ascending: 'Ascending',
      descending: 'Descending',
      create_a_folder: 'Create a folder',
      name: 'Name',
      created_date: 'Created date',
      start_date: 'Start date',
      end_date: 'End date',
      sent_date: 'Sent date',
      for_the_placement_on_timeline: '(used for the position on the timeline)',
      type: 'Type',
      color: 'Color',
      keywords: 'Keywords',
      author: 'Author(s)',
      zoom: 'Zoom',
      download: 'Download',
      caption: 'Caption',
      date: 'Date',
      'active_filter:': 'Active filter:',
      'medias_shown:': 'Medias shown:',
      'file:': 'File:',

      loading: 'loading',
      open: 'Open',
      save: 'Save',
      save_and_close: 'Save + close',
      edit: 'Edit',
      print: 'Print',
      create: 'Create',
      remove: 'Remove',
      password: 'Mot de passe',
      protected_by_pass: 'protected by password',
      password_instructions:
        'If set, only users with the password will be able to edit this folder and access the content that’s not public.',

      sort_by: 'Sort by',
      in_the_order: 'In the order',
      public: 'Public',
      content: 'Content',

      'lang:': 'Select lang:',
      lang: 'Select lang',

      keyboard_shortcuts: 'Keyboard shortcuts',
      keyboard_shortcuts_instructions:
        'Setup keyboard shortcuts that trigger the creation of colored time markers when a key is pressed on a keyboard.',

      credits:
        'A free and open-source app made by l’<a href="https://latelier-des-chercheurs.fr" class="js--openInBrowser" target="_blank">Atelier des Chercheurs</a> with and for the <a href="https://www.studiotheatre.fr/" class="js--openInBrowser" target="_blank">Studio-Théâtre de Vitry-sur-Seine</a>.',

      toconnectwithanotherdevice:
        'To access Les Cahiers with another device, connect to the same wifi network and type this adress in your browser:',
      toconnectwithanotherdevicetothisfolder:
        'To access this folder in Les Cahiers with another device, connect to the same wifi network and type this adress in your browser:',
      sureToRemoveFolder: 'Do you really want to delete this folder?',
      sureToRemoveMedia: 'Do you really want to delete this media?',
      sureToRemoveAuthor: 'Do you really want to delete this author?',
      sureToCloseModal: 'Do you really want to close this window?',

      create_a_folder: 'Create a folder',
      edit_the_media: 'Edit media',
      edit_folder: 'Edit folder',

      capture_start: 'Start of the capture',
      capture_end: 'End of the capture',
      currently: 'Now',

      more_information:
        'For more informations, read the <a href="https://latelier-des-chercheurs.fr/docs/manuel-les-cahiers-du-studio" class="js--openInBrowser" target="_blank">documentation (in french)</a> or <a href="mailto:info@latelier-des-chercheurs.fr?subject=Les Cahiers du Studio" class="js--openInBrowser" target="_blank">contact</a> the creators of this app.',

      no_media_in_folder: 'No media in this folder.',
      no_public_media_in_folder: 'No public media in this folder.',
      auto_scroll: 'autoscroll',
      scale: 'scale:',
      scale_items: {
        second: 'sec',
        minute: 'min',
        hour: 'h',
        half_day: '½d',
        day: 'd'
      },
      contents_are_stored: 'Contents for this folder are stored in ',
      folder_information: 'Folder information',
      calendar: 'Calendar',
      now: 'now',
      list: 'List',
      fullscreen: 'Fullscreen',
      preview: 'Preview',
      filter: 'Filter',

      export_folder: 'Export timeline as a webpage',
      export: 'Export',
      only_public_medias: 'Only medias marked <em>public</em>',
      select_type_of_export:
        'Select here the type of web export to get. It is possible to either export all medias of a timeline, or only the medias marked as "Public"',
      password_protect: 'Protect access with a password',
      allow_media_download: 'Allow download of original medias',
      export_with_all_medias: 'Export with all the medias',
      export_only_public_medias: 'Export only public medias',
      import_medias: 'Import medias',
      import_all_files: 'Import all files',
      select_files_to_import: 'Select files to import',

      last_modified: 'Last modified',

      notifications: {
        file_was_sent: 'The file was sent.',
        file_upload_not_allowed: 'File upload is not allowed by this browser.',
        connection_active: 'The connection to the server is active.',
        connection_lost: 'The connection to the server was lost.',
        contents_wont_be_editable: 'Content editing is disabled.',
        connection_error:
          'The connection to the server could not be established.',
        'wrong_password_for_folder:': 'Wrong password or folder missing for:',
        'created_edited_media:':
          'A media has been created or edited in folder:',
        author_name_exists:
          'Ce nom d’auteur existe déjà, utilisez-en un autre.',
        folder_name_exists: 'Folder name already exists. Please use another.',
        folder_name_needs_alphanumeric_characters:
          'Folder names need to contain at least one alphanumeric character.',
        'failed_to_get_folder:': 'Failed to get the requested folder:',
        folder_export_started: 'Export requested…'
      }
    }
  };

  return messages;
})();
