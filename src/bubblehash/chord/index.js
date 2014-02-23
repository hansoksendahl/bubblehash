
var Chord = (function () {
  var hash;
  
import "hash/";


// Computes a new key equal to key + 2 ^ exponent.
// Assumes key is a 4 element array of 32 bit words, most significant word first.
function addExp(key, exponent) {
    var result = key.concat(); // copy array
    var index = key.length - Math.floor(exponent / 32) - 1;

    result[index] += 1 << (exponent % 32);

    var carry = 0;
    while (index >= 0) {
        result[index] += carry;
        carry = 0;
        if (result[index] > 0xffffffff) {
            result[index] -= 0x100000000;
            carry = 1;
        }
        --index;
    }

    return result;
}

function next_key(key) {
    return addExp(key, 0);
}
  
  function Chord (version) {
    this.version = version;
    this.successor = null;
    this.predecessor = null;
  }
  
  // Shared Procedures
  
  Chord.prototype.findSuccessor = function findSuccessor (x) {
    // ask node n to ﬁnd the successor of x
    //
    //     if (x ∈ (n,n.successor])
    //       return n.successor;
    //     else
    //       n' := closestPrecedingNode(x);
    //       return n'.ﬁndSuccessor(x);
  };
  
  Chord.prototype.closestPrecedingNode = function closestPrecedingNode (x) {
    // search finger table for the highest predecessor of x
    //
    //     for i := m - 1 downto 1
    //       if (finger[i] ∈ (n, x))
    //         return finger[i];
    //       return n;
  };
  
  Chord.prototype.buildFingers = function buildFingers (s) {
    // build finger table
    //
    //     i₀ := ⌊log(successor - n)⌋ + 1;
    //     for i₀ ≤ i < m - 1
    //       finger[i] := s.findSuccessor(n + 2ⁱ);
  };
  
  Chord.prototype.fixFingers = function fixFingerl () {
    // periodically refresh finger table entries
    //
    //     buildFingers(n);
  };
  
  Chord.prototype.checkPredecessor = function checkPredecessor () {
    // periodically check whecher predecessor has failed
    //
    //     if (predecessor has failed)
    //       predecssor := nil;
  };
  
  Chord.prototype.fixSuccssorList = function fixSuccssorList () {
    // periodically reconcile with successors's successor list
    //
    //     ⟨s₁,…,sᵣ⟩ := successor.successorList
    //     successorList := ⟨successor,s₁,…,sᵣ₋₁⟩;
  };
  
  Chord.prototype.fixSuccssor = function fixSuccssor () {
    // periodically update failed successor
    //
    //     if (successor has failed)
    //       successor := smallest alive node in successorList
  };
  
  // Create dispatcher functions for join, stabilization, and notify
  
  [ "join"
  , "stabilization"
  , "notify"
  ].forEach(function(name) {
    Chord.prototype[name] = function () {
      this[name+this.version].apply(this, arguments);
    };
  });
  
  // Chord1 procedures
  
  Chord.prototype.join1 = function join (n_prime) {
    // node n joins through node n'
    //
    //     predecessor:= nil;
    //     s:= n'.ﬁndSuccessor(n);
    //     successor:= s;
    //     buildFngers(s);
  };
  
  Chord.prototype.stabilization1 = function stabilization () {
    // periodically probe n's successor s and inform s of n
    //
    //     checkPredecessor();
    //     x := successor.prdecessor;
    //
    // sucessor has changed due to new joining
    //
    //     if (x ∈ (n, successor))
    //       successor := x;
    //     successor.notify(n);
  };
  
  Chord.prototype.notify1 = function (n) {
    // notify s to be s's predecessor
    //
    //     if (predecssor = nil or n ∈ (predecssor, s))
    //       predecessor := n;
  };
  
  // Chord procedures
  
  Chord.prototype.join2 = function join2 () {
    // node n joins through node n'
    //
    //     predecessor := nil;
    //     s := n'.findSuccessor(n);
    //     successor := s;
    //     buildFingers(s);
    //
    // find super peer responsible for n via s
    //
    //     x :=s.Superpeer(n);
    //
    // insert link object into super peer
    //
    //     x.insertLinkObj(⟨n, s, nil⟩);
    //
    // insert finger objects into super peers responsible for them
    //
    //     for i := 1 to m - 1
    //     x.insertFingerObj(⟨finger[i], i, n⟩);
  };
  
  Chord.prototype.stabilization2 = function stabilization2 () {
    // node n periodically probes its successor link
    //
    //     Succₒ := successor;
    //     checkPredecessor();
    //
    // check if successor is alive
    //
    //     n.fixSuccessor();
    //     x := successor.predecessor;
    //     if (x ∈ (n, successor))
    //       successor:= x;
    //     successor.notify2(n);
    //     Succₙ := successor
    //     if (Succₙ ≠ Succₒ);
    //       Superpeer(n).linkUpdate(⟨n, Succₙ, predecessor⟩);
    //     if Succₒ ∈ (n, Succₙ)
    //       Superpeer(Succₒ).notifyLeave(Succₒ, Succₙ);
  };
  
  Chord.prototype.notify2 = function notify2 () {
    // n' nontifies n to be n's predecessor
    //
    //     Predₒ := predecessor;
    //     if n' ≠ Predₒ
    //       Superpeer(n).linkUpdate(⟨n,successor,n'⟩)
    //     if (predecessor = nil or n' ∈ (predecessor, n))
    //       predecessor := n';
    //       Superpeer(n).notifyJoin(Predₒ, n')
  };
  
  Chord.prototype.notifyJoin = function notifyJoin (Pred_o, Pred_n) {
    // notify Superpeer(n) the joining of Predₙ with Predₒ being the old
    // predecessor of n, where Predₙ ∈ (Predₒ, Predₙ]
    //
    // find super peer of Predₙ
    //
    //     let y = Superpeer(Predₙ)
    //     for each stored finger object obj = ⟨target, level, owner⟩
    //       if owner + 2ˡᵉᵛᵉˡ ∈ ⟨Predₒ, Predₙ⟩
    //         obj := ⟨Predₙ, level, owner⟩;
    //         transfer obj to y;
    //         owner.fixFinger(level, Predₙ);
  }
  
  Chord.prototype.fixFinger = function fixFinger (i, target) {
    // notify node n to fix its _i_th finger
    //
    //    finger[i] := target;
  };

  
  Chord.prototype.notifyLeave = function notifyLeave (Succ_o, Succ_n) {
    // notify super peer x the leave of Succₒ with Succₙ being the new successor
    // of Succₒ
    //
    // remove link object of key Succₒ
    //
    //     remove linkObject(Succₒ);
    //
    // find super peer of Succₙ
    //
    //     y = Superpeer(Succₙ);
    //     for each stored finger object obj = ⟨target, level, owner⟩
    //       if target = Succₒ
    //         obj := ⟨Succₙ, level, owner⟩;
    //         owner.fixFinger(level, target);
  };
  
  
  return Chord;
}());