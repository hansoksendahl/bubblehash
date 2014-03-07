// periodically reconcile with successors's successor list
//
//     ⟨s₁,…,sᵣ⟩ := successor.successorList
//     successorList := ⟨successor,s₁,…,sᵣ₋₁⟩;
Bubblehash.prototoype._fixSuccessorList function _fixSuccessorList () {
  this.successor.send({
    type: this._types.GET_SUCCESSOR_LIST
  });
}