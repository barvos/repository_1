from typing import Any

from selenium.webdriver.remote.command import Command as Command

from .actions.action_builder import ActionBuilder as ActionBuilder
from .utils import keys_to_typing as keys_to_typing

class ActionChains:
    w3c_actions: Any
    def __init__(self, driver) -> None: ...
    def perform(self) -> None: ...
    def reset_actions(self) -> None: ...
    def click(self, on_element: Any | None = ...): ...
    def click_and_hold(self, on_element: Any | None = ...): ...
    def context_click(self, on_element: Any | None = ...): ...
    def double_click(self, on_element: Any | None = ...): ...
    def drag_and_drop(self, source, target): ...
    def drag_and_drop_by_offset(self, source, xoffset, yoffset): ...
    def key_down(self, value, element: Any | None = ...): ...
    def key_up(self, value, element: Any | None = ...): ...
    def move_by_offset(self, xoffset, yoffset): ...
    def move_to_element(self, to_element): ...
    def move_to_element_with_offset(self, to_element, xoffset, yoffset): ...
    def pause(self, seconds): ...
    def release(self, on_element: Any | None = ...): ...
    def send_keys(self, *keys_to_send): ...
    def send_keys_to_element(self, element, *keys_to_send): ...
    def __enter__(self): ...
    def __exit__(self, _type, _value, _traceback) -> None: ...
