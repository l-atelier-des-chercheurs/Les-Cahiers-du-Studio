import Quill from "quill";
let BlockEmbed = Quill.import("blots/block/embed");

// inspired from https://gist.github.com/tranduongms1/584d43ec7d8ddeab458f087adbeef950
class MediaBlot extends BlockEmbed {
  static blotName = "media";
  static tagName = "figure";
  static className = "ql-mediacard";

  static create({ type, src, content, caption, metaFileName }) {
    let node = super.create();
    console.log(`CollaborativeEditor • MediaBlot : create for type = ${type}`);

    node.setAttribute("contenteditable", false);

    let bg = window.document.createElement("div");
    bg.setAttribute("class", "ql-mediacard--background");
    node.appendChild(bg);

    let tag;

    if (!type || !metaFileName) {
      alert(
        `Missing type or metaFileName : type = ${type} and metaFileName = ${metaFileName}`
      );
      return;
    }

    if (type === "image") {
      tag = window.document.createElement("img");
    } else if (type === "video") {
      tag = window.document.createElement("video");
      tag.setAttribute("controls", true);
    } else if (type === "audio") {
      tag = window.document.createElement("audio");
      tag.setAttribute("controls", true);
    } else if (type === "text") {
      tag = window.document.createElement("blockquote");
      tag.innerHTML = content;
    }

    if (src) {
      tag.setAttribute("src", src);
    }
    tag.setAttribute("draggable", false);
    node.appendChild(tag);
    if (caption) {
      let caption_tag = window.document.createElement("figcaption");
      caption_tag.innerHTML = caption;
      node.appendChild(caption_tag);
    }
    node.dataset.type = type;
    node.dataset.metaFileName = metaFileName;
    node.setAttribute("draggable", false);

    // todo for later: allow drag from cards in quill
    // to move inside document or to composition
    node.addEventListener("dragstart", $event => {
      $event.dataTransfer.setData("text/plain", "media_in_quill");
      $event.dataTransfer.effectAllowed = "move";
      // this.is_dragged = true;
      // this.$root.settings.media_being_dragged = media.metaFileName;
    });

    node.style.animation = "scale-in 0.5s cubic-bezier(0.19, 1, 0.22, 1)";
    node.addEventListener("animationend", () => {
      node.style.animation = "";
    });

    return node;
  }

  constructor(node) {
    super(node);

    let removeButton;
    let caption;
    let captionInput;

    node.__onSelect = () => {
      const quill = Quill.find(node.parentElement.parentElement);
      const _block = Quill.find(node);

      // quill.setSelection(quill.getIndex(_block), 0, Quill.sources.USER);
      node.classList.add("is--focused");

      removeButton = window.document.createElement("button");
      removeButton.innerHTML = "×";
      removeButton.setAttribute("type", "button");
      removeButton.classList.add("_button_removeMedia");
      removeButton.addEventListener("click", () => {
        node.__onDeselect();
        quill.enable(true);
        node.style.animation = "scale-out 0.5s cubic-bezier(0.19, 1, 0.22, 1)";
        node.addEventListener("animationend", () => {
          super.remove();
          // node.remove();
          // supprimer du bloc proprement
        });
      });
      node.appendChild(removeButton);

      caption = node.querySelector("figcaption");
      captionInput = window.document.createElement("input");
      captionInput.setAttribute("type", "text");
      captionInput.setAttribute("autofocus", true);
      captionInput.placeholder = "Légende…";

      if (caption) {
        captionInput.value = caption.innerText;
        caption.innerHTML = "";
        caption.appendChild(captionInput);
      } else {
        caption = window.document.createElement("figcaption");
        caption.appendChild(captionInput);
        node.appendChild(caption);
      }

      setTimeout(() => {
        captionInput.focus();
      }, 50);
    };
    node.__onDeselect = () => {
      let value = captionInput.value;
      if (!value || value === "") {
        caption.remove();
      } else {
        captionInput.remove();
        caption.innerText = value;
      }
      node.classList.remove("is--focused");
      removeButton.remove();
    };
  }

  // deleteAt() {
  //   console.log("deleteAt for custom mediablock: prevented");

  //   return false;
  //   // prevent removing on backspace after block
  // }

  static value(node) {
    if (node.dataset.type === "image") {
      let img = node.querySelector("img");
      let figcaption = node.querySelector("figcaption");
      if (!img) return false;
      return {
        alt: img.getAttribute("alt"),
        src: img.getAttribute("src"),
        metaFileName: node.dataset.metaFileName,
        type: node.dataset.type,
        caption: figcaption ? figcaption.innerText : null
      };
    } else if (node.dataset.type === "video") {
      let video = node.querySelector("video");
      let figcaption = node.querySelector("figcaption");
      if (!video) return false;
      return {
        alt: video.getAttribute("alt"),
        src: video.getAttribute("src"),
        metaFileName: node.dataset.metaFileName,
        type: node.dataset.type,
        caption: figcaption ? figcaption.innerText : null
      };
    } else if (node.dataset.type === "audio") {
      let audio = node.querySelector("audio");
      let figcaption = node.querySelector("figcaption");
      if (!audio) return false;
      return {
        alt: audio.getAttribute("alt"),
        src: audio.getAttribute("src"),
        metaFileName: node.dataset.metaFileName,
        type: node.dataset.type,
        caption: figcaption ? figcaption.innerText : null
      };
    } else if (node.dataset.type === "text") {
      let blockquote = node.querySelector("blockquote");
      let figcaption = node.querySelector("figcaption");
      if (!blockquote) return false;
      return {
        metaFileName: node.dataset.metaFileName,
        content: blockquote.innerHTML,
        type: node.dataset.type,
        caption: figcaption ? figcaption.innerText : null
      };
    }
  }
}

module.exports = MediaBlot;
